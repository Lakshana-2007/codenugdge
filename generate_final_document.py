import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn

BASE_DIR = r"D:\codenudge\project version 2"
SCREENSHOTS_DIR = os.path.join(BASE_DIR, "screenshots")
OUTPUT_DOCX = os.path.join(BASE_DIR, "CodeNudge_Assignment_1_Record.docx")

def create_complete_document():
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
    normal_style.font.color.rgb = RGBColor(0, 0, 0)
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
    # HELPER: ADD IMAGE ITEM (EXACTLY 3 PER PAGE ACROSS 3 PAGES)
    # ══════════════════════════════════════════════════════════════════
    def add_image_item(title, img_filename):
        p_t = doc.add_paragraph()
        p_t.paragraph_format.space_before = Pt(3)
        p_t.paragraph_format.space_after = Pt(1)
        p_t.paragraph_format.line_spacing = 1.0
        p_t.paragraph_format.keep_with_next = True
        run_t = p_t.add_run(title)
        run_t.font.name = 'Arial'
        run_t.font.size = Pt(10)
        run_t.font.bold = True
        run_t.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

        img_path = os.path.join(SCREENSHOTS_DIR, img_filename)
        if os.path.exists(img_path):
            p_img = doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.space_before = Pt(0)
            p_img.paragraph_format.space_after = Pt(4)
            p_img.paragraph_format.keep_with_next = True
            run_i = p_img.add_run()
            run_i.add_picture(img_path, width=Inches(4.1))

    # ── PICTURE PAGE 1 (Page 2 of document: 3 images) ──
    p_head = doc.add_paragraph()
    p_head.paragraph_format.space_before = Pt(0)
    p_head.paragraph_format.space_after = Pt(2)
    p_head.paragraph_format.keep_with_next = True
    run_title = p_head.add_run("OUTPUT / UI DESIGN")
    run_title.font.name = 'Arial'
    run_title.font.size = Pt(12)
    run_title.font.bold = True
    run_title.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

    add_image_item("UI Design : Home Page", "01_home_page.png")
    add_image_item("UI Design : Login Page", "02_login_page.png")
    add_image_item("UI Design : Dashboard", "03_dashboard.png")
    doc.add_page_break()

    # ── PICTURE PAGE 2 (Page 3 of document: 3 images) ──
    add_image_item("UI Design : Search User", "04_search_user.png")
    add_image_item("UI Design : User Profile", "05_user_profile.png")
    add_image_item("UI Design : Send Coding Nudge", "06_send_coding_nudge.png")
    doc.add_page_break()

    # ── PICTURE PAGE 3 (Page 4 of document: 3 images) ──
    add_image_item("UI Design : Notification Received", "07_notification_received.png")
    add_image_item("UI Design : Motivation Audio", "08_motivation_audio.png")
    add_image_item("UI Design : Start Coding", "09_start_coding.png")
    doc.add_page_break()

    # ══════════════════════════════════════════════════════════════════
    # PAGE 5 ONWARDS: COMPLETE SOURCE CODE (NO EXPLANATIONS)
    # ══════════════════════════════════════════════════════════════════
    p_code_header = doc.add_paragraph()
    p_code_header.paragraph_format.space_before = Pt(10)
    p_code_header.paragraph_format.space_after = Pt(8)
    p_code_header.paragraph_format.keep_with_next = True
    r_ch = p_code_header.add_run("SOURCE CODE")
    r_ch.font.name = 'Arial'
    r_ch.font.size = Pt(14)
    r_ch.font.bold = True
    r_ch.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

    def add_source_file(display_title, file_path):
        p_fhead = doc.add_paragraph()
        p_fhead.paragraph_format.space_before = Pt(12)
        p_fhead.paragraph_format.space_after = Pt(3)
        p_fhead.paragraph_format.keep_with_next = True
        rf = p_fhead.add_run(f"File: {display_title}")
        rf.font.name = 'Arial'
        rf.font.size = Pt(11)
        rf.font.bold = True
        rf.font.color.rgb = RGBColor(0x25, 0x63, 0xEB)

        if not os.path.exists(file_path):
            p_err = doc.add_paragraph()
            p_err.add_run(f"[File not found: {file_path}]")
            return

        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
            lines = f.read().splitlines()

        code_table = doc.add_table(rows=1, cols=1)
        code_table.alignment = WD_TABLE_ALIGNMENT.CENTER
        code_table.autofit = False
        code_table.rows[0].cells[0].width = Inches(7.4)

        cell = code_table.rows[0].cells[0]
        shd = parse_xml(r'<w:shd xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" w:val="clear" w:color="auto" w:fill="F8FAFC"/>')
        cell._tc.get_or_add_tcPr().append(shd)
        borders = parse_xml(r'''
            <w:tcBorders xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
                <w:top w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                <w:left w:val="single" w:sz="6" w:space="0" w:color="3B82F6"/>
                <w:bottom w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
                <w:right w:val="single" w:sz="4" w:space="0" w:color="CBD5E1"/>
            </w:tcBorders>
        ''')
        cell._tc.get_or_add_tcPr().append(borders)

        tcMar = OxmlElement('w:tcMar')
        for m in ['top', 'bottom']:
            node = OxmlElement(f'w:{m}')
            node.set(qn('w:w'), '80')
            node.set(qn('w:type'), 'dxa')
            tcMar.append(node)
        for m in ['left', 'right']:
            node = OxmlElement(f'w:{m}')
            node.set(qn('w:w'), '120')
            node.set(qn('w:type'), 'dxa')
            tcMar.append(node)
        cell._tc.get_or_add_tcPr().append(tcMar)

        p = cell.paragraphs[0]
        p.paragraph_format.line_spacing = 1.0
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)

        for idx, line in enumerate(lines, 1):
            r_num = p.add_run(f"{idx:4d} | ")
            r_num.font.name = 'Consolas'
            r_num.font.size = Pt(8.5)
            r_num.font.color.rgb = RGBColor(0x94, 0xA3, 0xB8)

            r_txt = p.add_run(f"{line}\n")
            r_txt.font.name = 'Consolas'
            r_txt.font.size = Pt(8.5)
            r_txt.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

        doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # 1. HTML Files
    add_source_file("public/index.html (HTML5)", os.path.join(BASE_DIR, "public", "index.html"))
    add_source_file("public/login.html (HTML5)", os.path.join(BASE_DIR, "public", "login.html"))
    add_source_file("public/register.html (HTML5)", os.path.join(BASE_DIR, "public", "register.html"))
    add_source_file("public/dashboard.html (HTML5)", os.path.join(BASE_DIR, "public", "dashboard.html"))
    add_source_file("public/profile.html (HTML5)", os.path.join(BASE_DIR, "public", "profile.html"))
    add_source_file("public/notifications.html (HTML5)", os.path.join(BASE_DIR, "public", "notifications.html"))

    # 2. CSS File
    add_source_file("public/css/style.css (CSS3)", os.path.join(BASE_DIR, "public", "css", "style.css"))

    # 3. JavaScript Files
    add_source_file("public/js/app.js (JavaScript ES6)", os.path.join(BASE_DIR, "public", "js", "app.js"))
    add_source_file("public/js/auth.js (JavaScript ES6)", os.path.join(BASE_DIR, "public", "js", "auth.js"))
    add_source_file("public/js/dashboard.js (JavaScript ES6)", os.path.join(BASE_DIR, "public", "js", "dashboard.js"))
    add_source_file("public/js/notifications.js (JavaScript ES6)", os.path.join(BASE_DIR, "public", "js", "notifications.js"))
    add_source_file("public/js/profile.js (JavaScript ES6)", os.path.join(BASE_DIR, "public", "js", "profile.js"))

    # 4. Node.js Server
    add_source_file("server.js (Node.js Core HTTP)", os.path.join(BASE_DIR, "server.js"))

    # 5. JSON Data Files
    add_source_file("data/users.json (JSON Database)", os.path.join(BASE_DIR, "data", "users.json"))
    add_source_file("data/reminders.json (JSON Database)", os.path.join(BASE_DIR, "data", "reminders.json"))

    # 6. Package JSON
    add_source_file("package.json (npm Configuration)", os.path.join(BASE_DIR, "package.json"))

    print(f"Saving final complete document to: {OUTPUT_DOCX}...")
    doc.save(OUTPUT_DOCX)
    print("Done! Complete document with Page 1 marks, Pages 2-4 screenshots, and complete source code created successfully!")

if __name__ == '__main__':
    create_complete_document()
