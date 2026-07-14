import fitz
import sys

def convert_pdf_to_svg(pdf_path, svg_path):
    doc = fitz.open(pdf_path)
    page = doc[0]
    svg_content = page.get_svg_image(matrix=fitz.Matrix(1, 1))
    with open(svg_path, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print(f"Extracted SVG to {svg_path}")

if __name__ == "__main__":
    convert_pdf_to_svg(sys.argv[1], sys.argv[2])
