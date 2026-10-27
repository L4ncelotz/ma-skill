import json
from pathlib import Path

sources = {
 'addy':('Addy Osmani','addyosmani/agent-skills','https://github.com/addyosmani/agent-skills'),
 'super':('Superpowers','obra/superpowers','https://github.com/obra/superpowers'),
 'matt':('Matt Pocock','mattpocock/skills','https://github.com/mattpocock/skills'),
 'vercelBrowser':('Vercel','vercel-labs/agent-browser','https://github.com/vercel-labs/agent-browser'),
 'context7':('Context7','upstash/context7','https://github.com/upstash/context7'),
 'caveman':('Caveman','JuliusBrussee/caveman','https://github.com/JuliusBrussee/caveman'),
 'taste':('Taste Skill','Leonxlnx/taste-skill','https://github.com/Leonxlnx/taste-skill'),
 'vercelSkills':('Vercel Skills','vercel-labs/skills','https://github.com/vercel-labs/skills'),
 'anthropic':('Anthropic','anthropics/skills','https://github.com/anthropics/skills'),
 'imagegen':('Imagegen Skills','Leonxlnx/imagegen-skills','https://github.com/Leonxlnx/imagegen-skills'),
 'img2three':('Img2ThreeJS','img2threejs/img2threejs','https://github.com/img2threejs/img2threejs'),
 'impeccable':('Impeccable','pbakaus/impeccable','https://github.com/pbakaus/impeccable'),
 'ponytail':('Ponytail','DietrichGebert/ponytail','https://github.com/DietrichGebert/ponytail'),
 'agentic':('Agentic Awesome','sickn33/agentic-awesome-skills','https://github.com/sickn33/agentic-awesome-skills'),
 'shadcn':('shadcn/ui','shadcn-ui/ui','https://github.com/shadcn-ui/ui'),
 'shadcnskills':('shadcn Skills','mattbx/shadcn-skills','https://github.com/mattbx/shadcn-skills'),
 'stopslop':('Stop Slop','hardikpandya/stop-slop','https://github.com/hardikpandya/stop-slop'),
 'react':('React Core','react/react','https://github.com/react/react'),
 'ecc':('Everything Claude Code','affaan-m/ECC','https://github.com/affaan-m/ECC'),
 'claudeTemplates':('Claude Code Templates','davila7/claude-code-templates','https://github.com/davila7/claude-code-templates'),
 'conflict':('แหล่งซ้ำ / ต้องตรวจ','หลาย Repository','')
}
categories = [
 ('Agent & Tools','Agent / เครื่องมือ'),
 ('Workflow','Workflow / วางแผน'),
 ('Code & Architecture','Code / Architecture'),
 ('Testing & Debug','Testing / Debug'),
 ('UI & Frontend','UI / Frontend'),
 ('Git & DevOps','Git / DevOps'),
 ('Research & Docs','Research / Docs'),
 ('Security & Ops','Security / Ops'),
 ('Style & Prompt','Style / Prompt'),
]
# columns: id, skill, category, source repo key, concise Thai use-description
items = [
(1,'agent-browser','Agent & Tools','vercelBrowser','ควบคุมเบราว์เซอร์สำหรับงาน Agent'),
(2,'agents/context7-mcp','Agent & Tools','context7','สำเนา Context7 ที่มี namespace ต่างกัน'),
(3,'api-and-interface-design','Code & Architecture','addy','ออกแบบ API และสัญญาระหว่างระบบ'),
(4,'brainstorming','Workflow','super','แตกไอเดียก่อนลงมือพัฒนา'),
(5,'browser-testing-with-devtools','Testing & Debug','addy','ทดสอบเว็บผ่าน DevTools และ runtime'),
(6,'caveman','Style & Prompt','caveman','ควบคุมรูปแบบการทำงานของ Agent'),
(7,'ci-cd-and-automation','Git & DevOps','addy','สร้างและดูแล CI/CD pipeline'),
(8,'code-review','Testing & Debug','matt','ตรวจคุณภาพและความเสี่ยงของโค้ด'),
(9,'code-review-and-quality','Testing & Debug','addy','Review โค้ดด้วยเกณฑ์คุณภาพ'),
(10,'code-simplification','Code & Architecture','addy','ลดความซับซ้อนโดยรักษาพฤติกรรม'),
(11,'codebase-design','Code & Architecture','matt','วางโครงสร้างและขอบเขต Codebase'),
(12,'context-engineering','Agent & Tools','addy','บริหาร Context ให้ Agent ทำงานแม่นยำ'),
(13,'context7-cli','Agent & Tools','context7','เรียก Docs ผ่าน Context7 CLI'),
(14,'context7-mcp','Agent & Tools','context7','เชื่อม Docs ล่าสุดผ่าน Context7 MCP'),
(15,'debugging-and-error-recovery','Testing & Debug','addy','ไล่หาสาเหตุและกู้คืนจาก Error'),
(16,'deprecation-and-migration','Code & Architecture','addy','ย้ายระบบและเลิกใช้งานของเก่า'),
(17,'design-taste-frontend','UI & Frontend','taste','กำกับรสนิยมและรายละเอียด UI'),
(18,'diagnosing-bugs','Testing & Debug','matt','วิเคราะห์ Bug และหาต้นเหตุ'),
(19,'dispatching-parallel-agents','Agent & Tools','super','แบ่งงานให้ Agent หลายตัวแบบขนาน'),
(20,'documentation-and-adrs','Research & Docs','addy','เขียนเอกสารและ Architecture Decisions'),
(21,'domain-modeling','Code & Architecture','matt','โมเดลกฎธุรกิจและ Domain'),
(22,'doubt-driven-development','Testing & Debug','addy','ทบทวนสมมติฐานและตรวจหลักฐาน'),
(23,'executing-plans','Workflow','super','ลงมือทำตาม Implementation Plan'),
(24,'find-docs','Research & Docs','context7','ค้นหา Documentation ที่เกี่ยวข้อง'),
(25,'find-skills','Agent & Tools','vercelSkills','ค้นหา Skill จาก Registry'),
(26,'finishing-a-development-branch','Git & DevOps','super','ปิดงาน Branch และจัดการ Merge'),
(27,'frontend-design','UI & Frontend','anthropic','ออกแบบหน้าเว็บและ UI'),
(28,'frontend-ui-engineering','UI & Frontend','addy','พัฒนา Frontend แบบเป็นระบบ'),
(29,'full-output-enforcement','Style & Prompt','taste','ช่วยกำกับความครบถ้วนของ Output'),
(30,'git-guardrails-claude-code','Git & DevOps','matt','Guardrail สำหรับคำสั่ง Git'),
(31,'git-workflow-and-versioning','Git & DevOps','addy','จัดการ Commit, Branch และ Version'),
(32,'grilling','Workflow','matt','ซักถามความต้องการเชิงลึก'),
(33,'idea-refine','Workflow','addy','เปลี่ยนไอเดียเป็นข้อเสนอที่ชัดเจน'),
(34,'image-to-code','UI & Frontend','imagegen','แปลงภาพอ้างอิงเป็น UI Code'),
(35,'img2threejs','UI & Frontend','img2three','แปลงภาพเป็นฉาก/องค์ประกอบ Three.js'),
(36,'impeccable','UI & Frontend','impeccable','เก็บรายละเอียดและยกระดับ UI'),
(37,'incremental-implementation','Workflow','addy','พัฒนาเป็นส่วนเล็กที่ตรวจสอบได้'),
(38,'interview-me','Workflow','addy','ถามความต้องการทีละข้อ'),
(39,'migrate-to-shoehorn','Code & Architecture','matt','Migration ไปยัง Shoehorn'),
(40,'observability-and-instrumentation','Security & Ops','addy','Logs, Metrics และ Tracing'),
(41,'performance-optimization','Security & Ops','addy','วัดและปรับประสิทธิภาพระบบ'),
(42,'planning-and-task-breakdown','Workflow','addy','แตกแผนเป็นงานย่อยที่ทำได้จริง'),
(43,'ponytail','Style & Prompt','ponytail','แนวทางกำกับพฤติกรรม Agent'),
(44,'prototype','Workflow','matt','สร้าง Prototype เพื่อทดสอบแนวคิด'),
(45,'react-nextjs-development','UI & Frontend','agentic','แนวทางพัฒนา React และ Next.js'),
(46,'receiving-code-review','Testing & Debug','super','นำ Feedback จาก Code Review ไปแก้'),
(47,'redesign-existing-projects','UI & Frontend','taste','ปรับดีไซน์ Project ที่มีอยู่'),
(48,'requesting-code-review','Testing & Debug','super','ขอให้ตรวจ Review ก่อนปิดงาน'),
(49,'research','Research & Docs','matt','ค้นคว้าและสังเคราะห์ข้อมูล'),
(50,'resolving-merge-conflicts','Git & DevOps','matt','จัดการความขัดแย้งระหว่าง Branch'),
(51,'scaffold-exercises','Workflow','matt','สร้างแบบฝึกหัดหรือโครงเริ่มต้น'),
(52,'security-and-hardening','Security & Ops','addy','ตรวจความปลอดภัยและ Hardening'),
(53,'setup-pre-commit','Git & DevOps','matt','ตั้งค่า Hooks เพื่อตรวจโค้ดก่อน Commit'),
(54,'shadcn','UI & Frontend','shadcn','ใช้งาน Component จาก shadcn/ui'),
(55,'shadcn-component-discovery','UI & Frontend','shadcnskills','ค้นหา Component ของ shadcn'),
(56,'shadcn-component-review','UI & Frontend','shadcnskills','Review Component ของ shadcn'),
(57,'shipping-and-launch','Git & DevOps','addy','เตรียม Deploy, Release และ Rollback'),
(58,'source-driven-development','Code & Architecture','addy','ตัดสินใจจาก Source และหลักฐาน'),
(59,'spec-driven-development','Workflow','addy','ทำงานจาก Specification ที่ชัดเจน'),
(60,'stop-slop','Style & Prompt','stopslop','ลดข้อความและผลลัพธ์ที่เยิ่นเย้อ'),
(61,'subagent-driven-development','Agent & Tools','super','แบ่งงานให้ Subagent หลายตัว'),
(62,'systematic-debugging','Testing & Debug','super','กระบวนการ Debug แบบเป็นขั้นตอน'),
(63,'tdd','Testing & Debug','matt','วงจร Red / Green / Refactor'),
(64,'test-driven-development','Testing & Debug','conflict','ชื่อซ้ำในหลายชุด ต้องตรวจต้นทางจริง'),
(65,'using-agent-skills','Agent & Tools','addy','เลือกและโหลด Skill ให้เข้ากับงาน'),
(66,'using-git-worktrees','Git & DevOps','super','สร้าง Workspace แยกด้วย Git Worktree'),
(67,'using-superpowers','Agent & Tools','super','กฎการใช้งานชุด Superpowers'),
(68,'verification-before-completion','Testing & Debug','super','ยืนยันผล Test/Build ก่อนปิดงาน'),
(69,'wizard','Workflow','matt','เวิร์กโฟลว์แบบ Wizard'),
(70,'writing-for-agents','Style & Prompt','matt','เขียนข้อความให้ Agent เข้าใจง่าย'),
(71,'writing-plans','Workflow','super','ร่างแผนลงมือพัฒนา'),
(72,'writing-skills','Agent & Tools','super','สร้างหรือปรับแต่ง SKILL.md'),
(73,'feature-flags','Testing & Debug','react','จัดการ Feature Flags และ @gate Tests ภายใน React Core (ไม่ใช่ระบบ Feature Flags ทั่วไป)'),
(74,'motion-patterns','UI & Frontend','ecc','แพตเทิร์น Motion สำหรับ React/Next.js; ต้องใช้ motion-foundations ร่วมด้วย'),
(75,'3d-web-experience','UI & Frontend','claudeTemplates','ออกแบบเว็บ 3D ด้วย Three.js, React Three Fiber, WebGL และ Spline'),
]
assert len(items)==75
assert [x[0] for x in items]==list(range(1,76))
from collections import Counter
print('source counts',Counter(row[3] for row in items))
S = set('agent-browser caveman code-review design-taste-frontend impeccable ponytail source-driven-development stop-slop systematic-debugging verification-before-completion'.split())
A = set('api-and-interface-design browser-testing-with-devtools ci-cd-and-automation code-review-and-quality context-engineering context7-cli context7-mcp debugging-and-error-recovery frontend-design frontend-ui-engineering git-guardrails-claude-code git-workflow-and-versioning performance-optimization planning-and-task-breakdown security-and-hardening spec-driven-development tdd test-driven-development using-git-worktrees'.split())
D = set('full-output-enforcement img2threejs migrate-to-shoehorn redesign-existing-projects scaffold-exercises wizard'.split())
C = set('agents/context7-mcp brainstormming code-simplification find-docs grilling idea-refine image-to-code interview-me react-nextjs-development receiving-code-review requesting-code-review shadcn-component-discovery shadcn-component-review using-agent-skills using-superpowers'.split())
C.remove('brainstormming')
# remaining default B
seed = []
for i,name,cat,source,description in items:
    tier = 'S' if name in S else 'A' if name in A else 'D' if name in D else 'C' if name in C else 'B'
    seed.append(dict(id=str(i),number=i,name=name,category=cat,originId=source,tier='U' if i>72 else tier,description=description,notes='',locations=[],customOriginLabel='',customOriginUrl='',skillUrl='',referenceUrl='',custom=False))
# Preserve exact skill-level URLs, not only repository homepages.
links = {
 'systematic-debugging':('https://github.com/obra/superpowers/tree/main/skills/systematic-debugging',''),
 'feature-flags':('https://github.com/react/react/tree/main/.claude/skills/feature-flags',''),
 'motion-patterns':('https://github.com/affaan-m/ECC/tree/main/skills/motion-patterns',
                    'https://github.com/affaan-m/ECC/tree/main/docs/ja-JP/skills/motion-patterns'),
 '3d-web-experience':('https://github.com/davila7/claude-code-templates/tree/main/cli-tool/components/skills/creative-design/3d-web-experience',''),
}
for skill in seed:
    skill['skillUrl'],skill['referenceUrl']=links.get(skill['name'],('',''))
print('tier counts',Counter(x['tier'] for x in seed))
Path(__file__).resolve().parent.joinpath('data-seed.json').write_text(json.dumps(dict(sources={k:dict(name=v[0],repo=v[1],url=v[2]) for k,v in sources.items()},categories=[dict(id=id,label=label) for id,label in categories],skills=seed),ensure_ascii=False,indent=2),encoding='utf-8')

# Build self-contained offline HTML from sources. Template's inline JS is
# replaced from app.js so it cannot accidentally drift from the tested code.
root = Path(__file__).resolve().parent
html = (root / 'template.html').read_text(encoding='utf-8')
assert '__STYLE_CSS__' in html
html = html.replace('__STYLE_CSS__', (root / 'vercel.css').read_text(encoding='utf-8'))
start = html.index("  <script>\n    'use strict';")
end = html.index('  </script>', start) + len('  </script>')
html = html[:start] + '  <script>\n' + (root / 'app.js').read_text(encoding='utf-8') + '\n  </script>' + html[end:]
seed_content = (root / 'data-seed.json').read_text(encoding='utf-8').replace('</', '<\\/')
ps_content = (root / 'skill-vault-backup.ps1').read_text(encoding='utf-8').replace('</', '<\\/')
assert '__SEED_JSON__' in html and '__PS_SCRIPT__' in html
html = html.replace('__SEED_JSON__', seed_content).replace('__PS_SCRIPT__', ps_content)
(root / 'skill-vault.html').write_text(html, encoding='utf-8')
print('Built standalone HTML:',len(html),'characters')
