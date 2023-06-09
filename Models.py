from typing import List
from pydantic import BaseModel


class Message(BaseModel):
    role: str
    content: str

class MessageSchema(BaseModel):
    messages: List[Message]