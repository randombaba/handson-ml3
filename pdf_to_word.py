#!/usr/bin/env python3
"""Convert PDF files (including scanned PDFs) into Word documents."""
from __future__ import annotations

import argparse
from pathlib import Path

import pdfplumber
import pytesseract
from docx import Document


def extract_text_from_page(page: pdfplumber.page.Page, ocr_lang: str, min_text_len: int) -> str:
    text = page.extract_text() or ""
    if len(text.strip()) >= min_text_len:
        return text

    image = page.to_image(resolution=300).original
    ocr_text = pytesseract.image_to_string(image, lang=ocr_lang)
    return ocr_text.strip() or text


def pdf_to_docx(pdf_path: Path, output_path: Path, ocr_lang: str, min_text_len: int) -> None:
    document = Document()
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        for index, page in enumerate(pdf.pages, start=1):
            text = extract_text_from_page(page, ocr_lang, min_text_len)
            if not text.strip():
                text = f"[[No text detected on page {index}]]"
            document.add_paragraph(text)
            if index < total_pages:
                document.add_page_break()
    document.save(output_path)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Convert PDF files (including scanned PDFs) into Word documents. "
            "Requires Tesseract OCR installed for scanned PDFs."
        )
    )
    parser.add_argument("inputs", nargs="+", type=Path, help="PDF files to convert")
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=None,
        help="Directory to write .docx files (defaults to input file directory)",
    )
    parser.add_argument(
        "--ocr-lang",
        default="eng",
        help="Tesseract language(s) for OCR, e.g. 'eng' or 'eng+deu'",
    )
    parser.add_argument(
        "--min-text-len",
        type=int,
        default=20,
        help="Minimum extracted text length before OCR is triggered",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    for input_path in args.inputs:
        if not input_path.exists():
            raise FileNotFoundError(f"Input not found: {input_path}")
        if input_path.suffix.lower() != ".pdf":
            raise ValueError(f"Input must be a PDF: {input_path}")

        output_dir = args.output_dir or input_path.parent
        output_dir.mkdir(parents=True, exist_ok=True)
        output_path = output_dir / f"{input_path.stem}.docx"

        pdf_to_docx(input_path, output_path, args.ocr_lang, args.min_text_len)
        print(f"Converted {input_path} -> {output_path}")


if __name__ == "__main__":
    main()
