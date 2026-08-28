import pytest
import asyncio
import json
from unittest.mock import MagicMock, AsyncMock, patch
from app.models.chat import ChatRequest, ChatMessage
from app.routes.chat import chat_stream, cognee


@pytest.mark.asyncio
async def test_memory_loop_integration():
    # Mock the cognee object inside the chat route
    mock_cognee_api = AsyncMock()
    mock_cognee_api.recall.return_value = [
        {"text": "Previous context: User mentioned they like NLP.", "metadata": {}}
    ]
    mock_cognee_api.remember = AsyncMock()

    # Inject the mock into the cognee service instance
    cognee._cognee = mock_cognee_api

    with patch("app.routes.chat.resolve_user_id", return_value="test_user"), patch(
        "app.routes.chat._stream_zai"
    ) as mock_stream:

        # Mock LLM stream
        async def mock_generator(*args, **kwargs):
            yield 'data: {"type": "content", "delta": "I remember you like NLP!"}\n\n'
            yield "data: [DONE]\n\n"

        mock_stream.side_effect = mock_generator

        request = ChatRequest(
            user_id="test_user",
            messages=[ChatMessage(role="user", content="What do I like?")],
            conversation_id="session_123",
        )

        # Call chat_stream
        response = await chat_stream(request)

        # Consume the stream
        full_content = ""
        async for line in response.body_iterator:
            if isinstance(line, bytes):
                line = line.decode("utf-8")
            if line.startswith("data: "):
                try:
                    payload = line[6:].strip()
                    if payload == "[DONE]":
                        continue
                    data = json.loads(payload)
                    if data.get("type") == "content":
                        full_content += data.get("delta")
                except:
                    pass

        assert "I remember you like NLP!" in full_content

        # Verify recall was called
        assert mock_cognee_api.recall.called

        # Verify remember was called (via remember_conversation)
        assert mock_cognee_api.remember.called


if __name__ == "__main__":
    asyncio.run(test_memory_loop_integration())
