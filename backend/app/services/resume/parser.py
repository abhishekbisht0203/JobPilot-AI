import PyPDF2
import docx
import io

async def parse_resume(file_content: bytes, filename: str) -> str:
    if filename.lower().endswith(".pdf"):
        return parse_pdf(file_content)
    elif filename.lower().endswith(".docx"):
        return parse_docx(file_content)
    return ""

def parse_pdf(content: bytes) -> str:
    text = ""
    with io.BytesIO(content) as file:
        reader = PyPDF2.PdfReader(file)
        for page in reader.pages:
            text += page.extract_text() + "\n"
    return text.strip()

def parse_docx(content: bytes) -> str:
    text = ""
    with io.BytesIO(content) as file:
        doc = docx.Document(file)
        for para in doc.paragraphs:
            text += para.text + "\n"
    return text.strip()
