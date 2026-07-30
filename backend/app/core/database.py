from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from .config import settings

client: AsyncIOMotorClient = None
sync_client: MongoClient = None

async def connect_db():
    global client
    client = AsyncIOMotorClient(settings.DATABASE_URL, serverSelectionTimeoutMS=5000)
    await client.server_info()

async def close_db():
    global client
    if client:
        client.close()

def get_db():
    return client[settings.MONGO_DB_NAME]

def get_sync_db():
    global sync_client
    if sync_client is None:
        sync_client = MongoClient(settings.DATABASE_URL, serverSelectionTimeoutMS=5000)
    return sync_client[settings.MONGO_DB_NAME]
