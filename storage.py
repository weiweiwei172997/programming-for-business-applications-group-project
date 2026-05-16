"""Persistent storage for GymPath accounts and community features.

The MVP uses SQLite so the app can run on the user's own computer without
extra database setup. The table layout is intentionally close to a MySQL-ready
schema so it can be migrated later.
"""

from __future__ import annotations

import hashlib
import hmac
import json
import os
import secrets
import sqlite3
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any


DB_PATH = Path(os.environ.get("GYMPATH_DB_PATH", Path(__file__).resolve().parent / "data" / "gympath_app.db"))
SESSION_DAYS = 14


def _utc_now() -> datetime:
    return datetime.now(timezone.utc)


def _iso_now() -> str:
    return _utc_now().isoformat(timespec="seconds")


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_storage() -> None:
    with _connect() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                email TEXT UNIQUE,
                password_hash TEXT NOT NULL,
                salt TEXT NOT NULL,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS sessions (
                token_hash TEXT PRIMARY KEY,
                user_id INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                content TEXT NOT NULL,
                image_path TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS comments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                post_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS post_likes (
                post_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                created_at TEXT NOT NULL,
                PRIMARY KEY (post_id, user_id),
                FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS measurements (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                measurement_date TEXT NOT NULL,
                weight_kg REAL,
                waist_cm REAL,
                body_fat_percent REAL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                UNIQUE(user_id, measurement_date),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS checkins (
                user_id INTEGER NOT NULL,
                checkin_date TEXT NOT NULL,
                created_at TEXT NOT NULL,
                PRIMARY KEY (user_id, checkin_date),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );

            CREATE TABLE IF NOT EXISTS workout_feedbacks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                feedback_date TEXT NOT NULL,
                completed INTEGER NOT NULL,
                fatigue_level INTEGER,
                duration_min INTEGER,
                pain_level INTEGER,
                adjustment_json TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            );
            """
        )
        post_columns = {row["name"] for row in conn.execute("PRAGMA table_info(posts)").fetchall()}
        if "image_path" not in post_columns:
            conn.execute("ALTER TABLE posts ADD COLUMN image_path TEXT")


def _hash_password(password: str, salt: str) -> str:
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120_000)
    return digest.hex()


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _public_user(row: sqlite3.Row) -> dict[str, Any]:
    return {
        "id": row["id"],
        "username": row["username"],
        "email": row["email"],
        "created_at": row["created_at"],
    }


def register_user(username: str, password: str, email: str | None = None) -> dict[str, Any]:
    username = username.strip()
    email = email.strip().lower() if email else None
    if len(username) < 2 or len(username) > 20:
        raise ValueError("昵称需要 2-20 个字符")
    if len(password) < 6:
        raise ValueError("密码至少需要 6 位")

    salt = secrets.token_hex(16)
    password_hash = _hash_password(password, salt)
    now = _iso_now()

    try:
        with _connect() as conn:
            cursor = conn.execute(
                """
                INSERT INTO users (username, email, password_hash, salt, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                (username, email, password_hash, salt, now),
            )
            user_id = cursor.lastrowid
            row = conn.execute("SELECT id, username, email, created_at FROM users WHERE id = ?", (user_id,)).fetchone()
    except sqlite3.IntegrityError as exc:
        raise ValueError("昵称或邮箱已被注册") from exc

    return _issue_session(_public_user(row))


def login_user(identifier: str, password: str) -> dict[str, Any]:
    identifier = identifier.strip()
    with _connect() as conn:
        row = conn.execute(
            """
            SELECT id, username, email, password_hash, salt, created_at
            FROM users
            WHERE username = ? OR email = ?
            """,
            (identifier, identifier.lower()),
        ).fetchone()

    if row is None:
        raise ValueError("账号或密码错误")

    candidate_hash = _hash_password(password, row["salt"])
    if not hmac.compare_digest(candidate_hash, row["password_hash"]):
        raise ValueError("账号或密码错误")

    return _issue_session(_public_user(row))


def _issue_session(user: dict[str, Any]) -> dict[str, Any]:
    token = secrets.token_urlsafe(32)
    expires_at = (_utc_now() + timedelta(days=SESSION_DAYS)).isoformat(timespec="seconds")
    with _connect() as conn:
        conn.execute(
            "INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)",
            (_hash_token(token), user["id"], _iso_now(), expires_at),
        )
    return {"token": token, "user": user, "expires_at": expires_at}


def get_user_by_token(token: str) -> dict[str, Any] | None:
    token_hash = _hash_token(token)
    now = _iso_now()
    with _connect() as conn:
        row = conn.execute(
            """
            SELECT users.id, users.username, users.email, users.created_at
            FROM sessions
            JOIN users ON users.id = sessions.user_id
            WHERE sessions.token_hash = ? AND sessions.expires_at > ?
            """,
            (token_hash, now),
        ).fetchone()
    return _public_user(row) if row else None


def create_post(user_id: int, title: str, content: str, image_path: str | None = None) -> dict[str, Any]:
    title = title.strip()
    content = content.strip()
    if len(title) < 2:
        raise ValueError("帖子标题至少需要 2 个字符")
    if len(content) < 5:
        raise ValueError("帖子内容至少需要 5 个字符")

    now = _iso_now()
    with _connect() as conn:
        cursor = conn.execute(
            """
            INSERT INTO posts (user_id, title, content, image_path, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (user_id, title[:80], content[:2000], image_path, now, now),
        )
        post_id = cursor.lastrowid
    return get_post(post_id, viewer_id=user_id)


def add_comment(user_id: int, post_id: int, content: str) -> dict[str, Any]:
    content = content.strip()
    if len(content) < 2:
        raise ValueError("评论至少需要 2 个字符")
    now = _iso_now()
    with _connect() as conn:
        post_exists = conn.execute("SELECT id FROM posts WHERE id = ?", (post_id,)).fetchone()
        if post_exists is None:
            raise ValueError("帖子不存在")
        cursor = conn.execute(
            "INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, ?)",
            (post_id, user_id, content[:800], now),
        )
        comment_id = cursor.lastrowid
        row = conn.execute(
            """
            SELECT comments.id, comments.post_id, comments.content, comments.created_at,
                   users.id AS author_id, users.username AS author
            FROM comments
            JOIN users ON users.id = comments.user_id
            WHERE comments.id = ?
            """,
            (comment_id,),
        ).fetchone()
    return dict(row)


def toggle_like(user_id: int, post_id: int) -> dict[str, Any]:
    with _connect() as conn:
        post_exists = conn.execute("SELECT id FROM posts WHERE id = ?", (post_id,)).fetchone()
        if post_exists is None:
            raise ValueError("帖子不存在")

        existing = conn.execute(
            "SELECT post_id FROM post_likes WHERE post_id = ? AND user_id = ?",
            (post_id, user_id),
        ).fetchone()
        if existing:
            conn.execute("DELETE FROM post_likes WHERE post_id = ? AND user_id = ?", (post_id, user_id))
            liked = False
        else:
            conn.execute(
                "INSERT INTO post_likes (post_id, user_id, created_at) VALUES (?, ?, ?)",
                (post_id, user_id, _iso_now()),
            )
            liked = True
        like_count = conn.execute("SELECT COUNT(*) AS count FROM post_likes WHERE post_id = ?", (post_id,)).fetchone()[
            "count"
        ]
    return {"post_id": post_id, "liked": liked, "like_count": like_count}


def list_posts(viewer_id: int | None = None) -> list[dict[str, Any]]:
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT posts.id, posts.title, posts.content, posts.image_path, posts.created_at, posts.updated_at,
                   users.id AS author_id, users.username AS author,
                   COUNT(DISTINCT post_likes.user_id) AS like_count,
                   COUNT(DISTINCT comments.id) AS comment_count
            FROM posts
            JOIN users ON users.id = posts.user_id
            LEFT JOIN post_likes ON post_likes.post_id = posts.id
            LEFT JOIN comments ON comments.post_id = posts.id
            GROUP BY posts.id
            ORDER BY posts.created_at DESC
            LIMIT 50
            """
        ).fetchall()
        posts = [_post_from_row(conn, row, viewer_id) for row in rows]
    return posts


def get_post(post_id: int, viewer_id: int | None = None) -> dict[str, Any]:
    with _connect() as conn:
        row = conn.execute(
            """
            SELECT posts.id, posts.title, posts.content, posts.image_path, posts.created_at, posts.updated_at,
                   users.id AS author_id, users.username AS author,
                   COUNT(DISTINCT post_likes.user_id) AS like_count,
                   COUNT(DISTINCT comments.id) AS comment_count
            FROM posts
            JOIN users ON users.id = posts.user_id
            LEFT JOIN post_likes ON post_likes.post_id = posts.id
            LEFT JOIN comments ON comments.post_id = posts.id
            WHERE posts.id = ?
            GROUP BY posts.id
            """,
            (post_id,),
        ).fetchone()
        if row is None:
            raise ValueError("帖子不存在")
        return _post_from_row(conn, row, viewer_id)


def _post_from_row(conn: sqlite3.Connection, row: sqlite3.Row, viewer_id: int | None) -> dict[str, Any]:
    comments = conn.execute(
        """
        SELECT comments.id, comments.post_id, comments.content, comments.created_at,
               users.id AS author_id, users.username AS author
        FROM comments
        JOIN users ON users.id = comments.user_id
        WHERE comments.post_id = ?
        ORDER BY comments.created_at ASC
        LIMIT 20
        """,
        (row["id"],),
    ).fetchall()
    viewer_liked = False
    if viewer_id is not None:
        viewer_liked = (
            conn.execute(
                "SELECT 1 FROM post_likes WHERE post_id = ? AND user_id = ?",
                (row["id"], viewer_id),
            ).fetchone()
            is not None
        )
    return {
        "id": row["id"],
        "title": row["title"],
        "content": row["content"],
        "image_url": f"/api/uploads/community/{row['image_path']}" if row["image_path"] else None,
        "author_id": row["author_id"],
        "author": row["author"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
        "like_count": row["like_count"],
        "comment_count": row["comment_count"],
        "viewer_liked": viewer_liked,
        "comments": [dict(comment) for comment in comments],
    }


def list_measurements(user_id: int) -> list[dict[str, Any]]:
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT measurement_date AS date, weight_kg, waist_cm, body_fat_percent
            FROM measurements
            WHERE user_id = ?
            ORDER BY measurement_date ASC
            """,
            (user_id,),
        ).fetchall()
    return [dict(row) for row in rows]


def replace_measurements(user_id: int, measurements: list[dict[str, Any]]) -> list[dict[str, Any]]:
    now = _iso_now()
    cleaned: list[tuple[str, float | None, float | None, float | None, str, str]] = []
    seen_dates: set[str] = set()
    for item in measurements:
        date = str(item.get("date", "")).strip()
        if not date or date in seen_dates:
            continue
        seen_dates.add(date)
        cleaned.append(
            (
                date,
                item.get("weight_kg"),
                item.get("waist_cm"),
                item.get("body_fat_percent"),
                now,
                now,
            )
        )

    with _connect() as conn:
        conn.execute("DELETE FROM measurements WHERE user_id = ?", (user_id,))
        conn.executemany(
            """
            INSERT INTO measurements (
                user_id, measurement_date, weight_kg, waist_cm, body_fat_percent, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            [(user_id, *entry) for entry in cleaned],
        )
    return list_measurements(user_id)


def list_checkins(user_id: int) -> list[str]:
    with _connect() as conn:
        rows = conn.execute(
            """
            SELECT checkin_date
            FROM checkins
            WHERE user_id = ?
            ORDER BY checkin_date ASC
            """,
            (user_id,),
        ).fetchall()
    return [row["checkin_date"] for row in rows]


def add_checkin(user_id: int, checkin_date: str) -> list[str]:
    date = checkin_date.strip()
    if not date:
        raise ValueError("打卡日期不能为空")
    with _connect() as conn:
        conn.execute(
            "INSERT OR IGNORE INTO checkins (user_id, checkin_date, created_at) VALUES (?, ?, ?)",
            (user_id, date, _iso_now()),
        )
    return list_checkins(user_id)


def create_workout_feedback(
    user_id: int,
    feedback: dict[str, Any],
    adjustment: dict[str, Any],
    feedback_date: str | None = None,
) -> dict[str, Any]:
    date = (feedback_date or _utc_now().date().isoformat()).strip()
    now = _iso_now()
    with _connect() as conn:
        cursor = conn.execute(
            """
            INSERT INTO workout_feedbacks (
                user_id, feedback_date, completed, fatigue_level, duration_min, pain_level, adjustment_json, created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                user_id,
                date,
                1 if feedback.get("completed") else 0,
                feedback.get("fatigue_level"),
                feedback.get("duration_min"),
                feedback.get("pain_level"),
                json.dumps(adjustment, ensure_ascii=False),
                now,
            ),
        )
        feedback_id = cursor.lastrowid
    return {"id": feedback_id, "date": date, "saved": True}
