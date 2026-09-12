import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

BASE_DIR = r"D:\codenudge\project version 2"
SCREENSHOTS_DIR = os.path.join(BASE_DIR, "screenshots")
OUTPUT_DOCX = os.path.join(BASE_DIR, "CodeNudge_Assignment_1_Record.docx")

def create_4page_document():
    doc = docx.Document()

    # Set page margins (0.4 in top/bottom, 0.5 in left/right)
    for section in doc.sections:
        section.top_margin = Inches(0.4)
        section.bottom_margin = Inches(0.4)
        section.left_margin = Inches(0.5)
        section.right_margin = Inches(0.5)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)

    # Base Normal Style
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Times New Roman'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(0x00, 0x00, 0x00)
    normal_style.paragraph_format.line_spacing = 1.15
    normal_style.paragraph_format.space_after = Pt(2)

    # ══════════════════════════════════════════════════════════════════
    # PAGE 1: EXACT SAMPLE ASSIGNMENT HEADER + MARKS ALLOCATION
    # ══════════════════════════════════════════════════════════════════
    p_top = doc.add_paragraph()
    p_top.paragraph_format.space_before = Pt(40)

    p_head = doc.add_paragraph()
    p_head.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run_head = p_head.add_run("U21AD502 – APPLICATION DEVELOPMENT – ASSIGNMENT 1")
    run_head.font.name = 'Times New Roman'
    run_head.font.size = Pt(15)
    run_head.font.bold = True
    run_head.font.color.rgb = RGBColor(0, 0, 0)
    p_head.paragraph_format.space_after = Pt(36)

    p_info = doc.add_paragraph()
    p_info.paragraph_format.line_spacing = 1.4
    p_info.paragraph_format.space_after = Pt(40)
    
    r1 = p_info.add_run("NAME : [MY NAME]\n")
    r1.font.bold = True
    r1.font.size = Pt(12)
    
    r2 = p_info.add_run("ROLLNO: [MY ROLL NUMBER]\n")
    r2.font.bold = True
    r2.font.size = Pt(12)
    
    r3 = p_info.add_run("SUBMISSION DATE: [DATE]\n")
    r3.font.bold = True
    r3.font.size = Pt(12)

    p_marks_title = doc.add_paragraph()
    run_mt = p_marks_title.add_run("MARKS")
    run_mt.font.bold = True
    run_mt.font.size = Pt(13)
    p_marks_title.paragraph_format.space_after = Pt(16)

    table = doc.add_table(rows=5, cols=2)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False

    col_widths = [Inches(5.4), Inches(1.6)]
    for row in table.rows:
        for i, w in enumerate(col_widths):
            row.cells[i].width = w

    for row in table.rows:
        for cell in row.cells:
            tcPr = cell._tc.get_or_add_tcPr()
            tcMar = OxmlElement('w:tcMar')
            for m in ['top', 'bottom']:
                node = OxmlElement(f'w:{m}')
                node.set(qn('w:w'), '140')
                node.set(qn('w:type'), 'dxa')
                tcMar.append(node)
            for m in ['left', 'right']:
                node = OxmlElement(f'w:{m}')
                node.set(qn('w:w'), '180')
                node.set(qn('w:type'), 'dxa')
                tcMar.append(node)
            tcPr.append(tcMar)
            borders = parse_xml(r'''
                <w:tcBorders xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
                    <w:top w:val="single" w:sz="6" w:space="0" w:color="000000"/>
                    <w:left w:val="single" w:sz="6" w:space="0" w:color="000000"/>
                    <w:bottom w:val="single" w:sz="6" w:space="0" w:color="000000"/>
                    <w:right w:val="single" w:sz="6" w:space="0" w:color="000000"/>
                </w:tcBorders>
            ''')
            tcPr.append(borders)

    r0c0 = table.cell(0, 0).paragraphs[0]
    r0c0.add_run("Evaluation Component").font.bold = True
    r0c1 = table.cell(0, 1).paragraphs[0]
    r0c1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r0c1.add_run("Max Marks").font.bold = True

    r1c0 = table.cell(1, 0).paragraphs[0]
    r1c0.add_run("1. User Interface Design & Layout -\n   HTML Structure")
    r1c1 = table.cell(1, 1).paragraphs[0]
    r1c1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r1c1.add_run("(15)")

    r2c0 = table.cell(2, 0).paragraphs[0]
    r2c0.add_run("2. CSS Implementation & JavaScript\n   Functionality and Validation")
    r2c1 = table.cell(2, 1).paragraphs[0]
    r2c1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r2c1.add_run("(15)")

    r3c0 = table.cell(3, 0).paragraphs[0]
    r3c0.add_run("3. Server side programming")
    r3c1 = table.cell(3, 1).paragraphs[0]
    r3c1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r3c1.add_run("(10)")

    r4c0 = table.cell(4, 0).paragraphs[0]
    r4_run = r4c0.add_run("TOTAL")
    r4_run.font.bold = True
    r4c1 = table.cell(4, 1).paragraphs[0]
    r4c1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r4_run2 = r4c1.add_run("(40)")
    r4_run2.font.bold = True

    p_sig = doc.add_paragraph()
    p_sig.paragraph_format.space_before = Pt(80)
    p_sig.paragraph_format.space_after = Pt(20)
    run_sig1 = p_sig.add_run("Staff Signature: ______________________             Date: _________________")
    run_sig1.font.bold = True
    run_sig1.font.size = Pt(11)

    # END OF PAGE 1 -> Go to Page 2
    doc.add_page_break()

    # ══════════════════════════════════════════════════════════════════
    # HELPER: ADD 2x2 SCREENSHOT GRID TO A PAGE
    # ══════════════════════════════════════════════════════════════════
    def add_grid_page(items, page_title=None):
        if page_title:
            p_head = doc.add_paragraph()
            p_head.paragraph_format.space_before = Pt(0)
            p_head.paragraph_format.space_after = Pt(4)
            p_head.paragraph_format.keep_with_next = True
            run_title = p_head.add_run(page_title)
            run_title.font.name = 'Arial'
            run_title.font.size = Pt(12)
            run_title.font.bold = True
            run_title.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

        # 2 rows, 2 columns table
        table = doc.add_table(rows=2, cols=2)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        table.autofit = False

        col_w = Inches(3.68)
        for row in table.rows:
            for cell in row.cells:
                cell.width = col_w
                # Invisible borders
                tcPr = cell._tc.get_or_add_tcPr()
                borders = parse_xml(r'''
                    <w:tcBorders xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
                        <w:top w:val="none"/>
                        <w:left w:val="none"/>
                        <w:bottom w:val="none"/>
                        <w:right w:val="none"/>
                    </w:tcBorders>
                ''')
                tcPr.append(borders)
                tcMar = OxmlElement('w:tcMar')
                for m in ['top', 'bottom']:
                    node = OxmlElement(f'w:{m}')
                    node.set(qn('w:w'), '40')
                    node.set(qn('w:type'), 'dxa')
                    tcMar.append(node)
                for m in ['left', 'right']:
                    node = OxmlElement(f'w:{m}')
                    node.set(qn('w:w'), '60')
                    node.set(qn('w:type'), 'dxa')
                    tcMar.append(node)
                tcPr.append(tcMar)

        coords = [(0, 0), (0, 1), (1, 0), (1, 1)]
        for idx, (title, img_filename) in enumerate(items):
            r, c = coords[idx]
            cell = table.cell(r, c)
            p = cell.paragraphs[0]
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.line_spacing = 1.0
            p.paragraph_format.keep_with_next = True
            
            run_t = p.add_run(title + "\n")
            run_t.font.name = 'Arial'
            run_t.font.size = Pt(9.5)
            run_t.font.bold = True
            run_t.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

            img_path = os.path.join(SCREENSHOTS_DIR, img_filename)
            if os.path.exists(img_path):
                p_img = cell.add_paragraph()
                p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
                p_img.paragraph_format.space_before = Pt(0)
                p_img.paragraph_format.space_after = Pt(2)
                p_img.paragraph_format.keep_with_next = True
                run_i = p_img.add_run()
                run_i.add_picture(img_path, width=Inches(3.55))

    # ── PAGE 2: 4 Screenshots ──
    page2_items = [
        ("UI Design : Home Page", "01_home_page.png"),
        ("UI Design : Login Page", "02_login_page.png"),
        ("UI Design : Dashboard", "03_dashboard.png"),
        ("UI Design : Search User", "04_search_user.png"),
    ]
    add_grid_page(page2_items, page_title="OUTPUT / UI DESIGN — CodeNudge (Part 1)")
    doc.add_page_break()

    # ── PAGE 3: 4 Screenshots ──
    page3_items = [
        ("UI Design : User Profile", "05_user_profile.png"),
        ("UI Design : Send Coding Nudge", "06_send_coding_nudge.png"),
        ("UI Design : Notification Received", "07_notification_received.png"),
        ("UI Design : Motivation Audio", "08_motivation_audio.png"),
    ]
    add_grid_page(page3_items, page_title="OUTPUT / UI DESIGN — CodeNudge (Part 2)")
    doc.add_page_break()

    # ── PAGE 4: 4 Screenshots ──
    page4_items = [
        ("UI Design : Start Coding", "09_start_coding.png"),
        ("UI Design : Reminder History", "10_reminder_history.png"),
        ("UI Design : Validation", "11_validation.png"),
        ("UI Design : Node.js Server Response", "12_server_response.png"),
    ]
    add_grid_page(page4_items, page_title="OUTPUT / UI DESIGN — CodeNudge (Part 3)")
    # NO FURTHER PAGE BREAKS -> TOTAL EXACTLY 4 PAGES!

    print(f"Saving 4-page document to: {OUTPUT_DOCX}...")
    doc.save(OUTPUT_DOCX)
    print("4-page document created successfully!")

if __name__ == '__main__':
    create_4page_document()
