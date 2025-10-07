from groq import Groq
from django.conf import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

client = Groq(api_key=settings.GROQ_API_KEY)

def murph_query(prompt: str) -> str:
    """
    Send astronomy-related prompt to Groq API and return the model response.
    """
    completion = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are Murph AI — an astronomy and astrophysics specialist. "
                    "Answer clearly, scientifically, and concisely for students, researchers, "
                    "and enthusiasts. If a question is unrelated to space or astronomy, "
                    "politely redirect it back to cosmic topics."
                ),
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.6,
        max_tokens=1500,
    )
    return completion.choices[0].message.content


def murph_query_stream(prompt: str):
    """
    Stream astronomy-related prompt responses from Groq API.
    Yields chunks of the response for real-time streaming.
    """
    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are Murph AI — an astronomy and astrophysics specialist. "
                        "Answer clearly, scientifically, and concisely for students, researchers, "
                        "and enthusiasts. If a question is unrelated to space or astronomy, "
                        "politely redirect it back to cosmic topics."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.6,
            max_tokens=1500,
            stream=True,  # Enable streaming
        )
        
        for chunk in completion:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    except Exception as e:
        logger.error(f"Streaming error: {e}")
        yield f"Error: {str(e)}"
