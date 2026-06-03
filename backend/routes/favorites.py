from fastapi import APIRouter, HTTPException
from database import get_db

router = APIRouter()


@router.get("/favorites")
def get_favorites():
    db = get_db()
    rows = db.execute(
        "SELECT * FROM favorites ORDER BY added_at DESC"
    ).fetchall()
    db.close()
    return {"favorites": [dict(r) for r in rows]}


@router.post("/favorites")
def add_favorite(data: dict):
    db = get_db()
    try:
        db.execute(
            """INSERT OR REPLACE INTO favorites
               (video_id, title, artist, thumbnail, duration)
               VALUES (?, ?, ?, ?, ?)""",
            (
                data["video_id"],
                data["title"],
                data.get("artist", "Unknown"),
                data.get("thumbnail", ""),
                data.get("duration", 0),
            ),
        )
        db.commit()
        return {"status": "ok"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        db.close()


@router.delete("/favorites/{video_id}")
def remove_favorite(video_id: str):
    db = get_db()
    db.execute("DELETE FROM favorites WHERE video_id = ?", (video_id,))
    db.commit()
    db.close()
    return {"status": "ok"}
