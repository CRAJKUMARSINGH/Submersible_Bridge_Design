import os
from markitdown import MarkItDown

def main():
    pdf_path = r"c:\Users\Rajkumar\Submersible_Bridge_Design\attached_assets\Type Design of submersible causeway.pdf"
    output_path = r"c:\Users\Rajkumar\Submersible_Bridge_Design\data\extracted\TYPE_document.md"
    
    print(f"Extracting {pdf_path}...")
    
    # Initialize MarkItDown. No llm client provided, so it just does basic layout/text extraction.
    md = MarkItDown()
    result = md.convert(pdf_path)
    
    print(f"Extraction successful. Writing to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(result.text_content)
        
    print("Done.")

if __name__ == "__main__":
    main()
