from fastapi import APIRouter, HTTPException
from database import get_db

router = APIRouter()


@router.get("/playlists")
def get_playlists():
    db = get_db()
    playlists = db.execute("SELECT * FROM playlists ORDER BY created_at DESC").fetchall()
    result = []
    for pl in playlists:
        pl_dict = dict(pl)
        song_count = db.execute(
            "SELECT COUNT(*) as count FROM playlist_songs WHERE playlist_id = ?",
            (pl["id"],),
        ).fetchone()["count"]
        pl_dict["song_count"] = song_count
        result.append(pl_dict)
    db.close()
    return {"playlists": result}


@router.post("/playlists")
def create_playlist(data: dict):
    db = get_db()
    try:
        cur = db.execute(
            "INSERT INTO playlists (name, description) VALUES (?, ?)",
            (data["name"], data.get("description", "")),
        )
        db.commit()
        return {"id": cur.lastrowid, "name": data["name"]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()


@router.delete("/playlists/{playlist_id}")
def delete_playlist(playlist_id: int):
    db = get_db()
    db.execute("DELETE FROM playlists WHERE id = ?", (playlist_id,))
    db.commit()
    db.close()
    return {"status": "ok"}


@router.get("/playlists/{playlist_id}/songs")
def get_playlist_songs(playlist_id: int):
    db = get_db()
    rows = db.execute(
        "SELECT * FROM playlist_songs WHERE playlist_id = ? ORDER BY position",
        (playlist_id,),
    ).fetchall()
    db.close()
    return {"songs": [dict(r) for r in rows]}


@router.post("/playlists/{playlist_id}/songs")
def add_song_to_playlist(playlist_id: int, data: dict):
    db = get_db()
    try:
        max_pos = db.execute(
            "SELECT COALESCE(MAX(position), -1) as m FROM playlist_songs WHERE playlist_id = ?",
            (playlist_id,),
        ).fetchone()["m"]
        db.execute(
            """INSERT INTO playlist_songs
               (playlist_id, video_id, title, artist, thumbnail, duration, position)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (
                playlist_id,
                data["video_id"],
                data["title"],
                data.get("artist", "Unknown"),
                data.get("thumbnail", ""),
                data.get("duration", 0),
                max_pos + 1,
            ),
        )
        db.commit()
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()


@router.delete("/playlists/{playlist_id}/songs/{song_id}")
def remove_song_from_playlist(playlist_id: int, song_id: int):
    db = get_db()
    db.execute(
        "DELETE FROM playlist_songs WHERE id = ? AND playlist_id = ?",
        (song_id, playlist_id),
    )
    db.commit()
    db.close()
    return {"status": "ok"}
