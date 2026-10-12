<?php
/**
 * Seed content migrated from snccollegedpr.in (2026-10-09). Facts only — see docs/01-DESIGN-SYSTEM.md §8.3.
 * Unverified items are NOT here; they live in snc_seed_samples() with a "[SAMPLE]" title prefix.
 */

if (!defined('ABSPATH')) {
    exit;
}

// --- Block markup helpers (so editors get native Gutenberg blocks) ---------------------------

function snc_b_p(string $html): string {
    return "<!-- wp:paragraph -->\n<p>$html</p>\n<!-- /wp:paragraph -->\n\n";
}

function snc_b_h(string $text, int $level = 2): string {
    $attr = $level === 2 ? '' : ' {"level":' . $level . '}';
    return "<!-- wp:heading$attr -->\n<h$level class=\"wp-block-heading\">$text</h$level>\n<!-- /wp:heading -->\n\n";
}

/**
 * $class adds a WordPress "Additional CSS class" to the list. Use 'snc-steps' on a short
 * ordered list to render it as numbered step cards (styled in the frontend's globals.css).
 */
function snc_b_ul(array $items, bool $ordered = false, string $class = ''): string {
    $tag = $ordered ? 'ol' : 'ul';
    $json = array_filter(['ordered' => $ordered ?: null, 'className' => $class ?: null]);
    $attr = $json ? ' ' . wp_json_encode($json) : '';
    $css = trim('wp-block-list ' . $class);
    $lis = implode('', array_map(fn($i) => "<!-- wp:list-item -->\n<li>$i</li>\n<!-- /wp:list-item -->\n", $items));
    return "<!-- wp:list$attr -->\n<$tag class=\"$css\">$lis</$tag>\n<!-- /wp:list -->\n\n";
}

function snc_b_table(array $head, array $rows): string {
    $th = implode('', array_map(fn($h) => "<th>$h</th>", $head));
    $tr = implode('', array_map(fn($r) => '<tr>' . implode('', array_map(fn($c) => "<td>$c</td>", $r)) . '</tr>', $rows));
    return "<!-- wp:table -->\n<figure class=\"wp-block-table\"><table><thead><tr>$th</tr></thead><tbody>$tr</tbody></table></figure>\n<!-- /wp:table -->\n\n";
}

function snc_b_quote(string $text): string {
    return "<!-- wp:quote -->\n<blockquote class=\"wp-block-quote\"><!-- wp:paragraph -->\n<p>$text</p>\n<!-- /wp:paragraph --></blockquote>\n<!-- /wp:quote -->\n\n";
}

// --- Settings ---------------------------------------------------------------------------------

function snc_seed_settings(): array {
    return [
        'college_name'    => 'Shiv Narayan Choubisa College, Simalwara',
        'hindi_name'      => 'शिवनारायण चौबीसा महाविद्यालय, सीमलवाड़ा',
        'short_about'     => 'Shiv Narayan Choubisa College, Simalwara was established in 2005 by Pragati Sansthan, Dungarpur. The college offers undergraduate programmes in Arts and Science and is affiliated to Govind Guru Tribal University, Banswara.',
        'affiliation'     => 'Govind Guru Tribal University (GGTU), Banswara',
        'phone_admission' => '+91 94143 52319',
        'phone_office'    => '+91 99830 05899',
        'whatsapp'        => '9414352319',
        'email'           => 'sncdpr@gmail.com',
        'address'         => 'Merop Road, Near Tehsil, M. Dhambola, Simalwara, Dungarpur, Rajasthan 314403',
        'map_link'        => '',
        'map_embed_url'   => '',
        'office_hours'    => '',
        'facebook'        => 'https://www.facebook.com/SNCsimalwara',
        'instagram'       => 'https://www.instagram.com/pragatigroups/',
        'youtube'         => 'https://www.youtube.com/@pragatiandsnccollege',
        'session_label'   => '',
        'admission_open'  => false,
        'apply_url'       => '',
        'about_eyebrow'   => 'About SNC',
        'about_heading'   => 'Higher education in Arts and Science at Simalwara since 2005',
        'about_body'      => "Shiv Narayan Choubisa College, Simalwara was founded in 2005 by Pragati Sansthan, Dungarpur, under the leadership of its President, Mr. Prashant Choubisa. The college offers B.A. and B.Sc. programmes and is affiliated to Govind Guru Tribal University, Banswara.\n\nWith experienced faculty, practical laboratories and an inclusive campus culture, the college works to develop knowledgeable, disciplined and responsible young people who contribute to society.",
        'about_image_id'  => 0,
        'why_items'       => [
            ['icon' => 'graduation-cap', 'title' => 'Affiliated to GGTU, Banswara', 'text' => 'Degree programmes of Govind Guru Tribal University, Banswara, in the semester pattern.'],
            ['icon' => 'flask-conical', 'title' => 'Practical science laboratories', 'text' => 'Chemistry, Botany, Zoology and Geography labs for hands-on learning.'],
            ['icon' => 'library', 'title' => 'Library and reading hall', 'text' => 'Textbooks, reference books, journals and a quiet space for self-study.'],
            ['icon' => 'wifi', 'title' => 'Computer lab and Wi-Fi campus', 'text' => 'Computer systems with internet access to support digital literacy.'],
            ['icon' => 'hand-coins', 'title' => 'Scholarship guidance', 'text' => 'Help with Rajasthan Government and central scholarship applications.'],
            ['icon' => 'briefcase', 'title' => 'Skill development and placement', 'text' => 'Workshops on communication and computer skills, with career guidance.'],
        ],
        'facts' => [
            ['value' => '2005', 'label' => 'Established'],
            ['value' => 'B.A. & B.Sc.', 'label' => 'Undergraduate programmes'],
            ['value' => 'GGTU', 'label' => 'Affiliating university'],
            ['value' => 'Pragati Sansthan', 'label' => 'Managed by'],
        ],
        'cta_heading'     => 'Begin your journey at SNC College',
        'cta_text'        => 'Contact the admission cell for programme details, eligibility and the admission schedule.',
        'cta_image_id'    => 0,
        'default_og_image_id' => 0,
    ];
}

// --- Programmes -------------------------------------------------------------------------------

function snc_seed_programmes(): array {
    return [
        [
            'slug' => 'ba', 'title' => 'Bachelor of Arts (B.A.)', 'order' => 1, 'level' => 'ug', 'programme' => 'ba',
            'excerpt' => 'A broad foundation in the humanities and social sciences that builds analytical, communication and critical-thinking skills.',
            'content' => snc_b_p('The B.A. programme at Shiv Narayan Choubisa College offers a broad foundation in the humanities and social sciences. Designed to encourage critical thinking and cultural understanding, this three-year degree helps students build analytical and communication skills for diverse career paths.')
                . snc_b_h('Programme highlights')
                . snc_b_ul(['Emphasis on cultural, historical and linguistic understanding.', 'Preparation for civil services, teaching, journalism and further study.', 'Experienced faculty with research backgrounds.']),
            'meta' => [
                'snc_short_name'   => 'B.A.',
                'snc_duration'     => '3 years',
                'snc_pattern'      => 'Semester pattern',
                'snc_eligibility'  => '10+2 pass from any recognised board in any stream.',
                'snc_subjects'     => "Hindi Literature\nSanskrit\nHistory\nPolitical Science\nSociology\nEconomics\nGeography",
                'snc_career_paths' => "Civil services and competitive examinations\nTeaching (after B.Ed.)\nJournalism and mass communication\nHigher studies (M.A.)\nSocial sector and administration",
            ],
        ],
        [
            'slug' => 'bsc', 'title' => 'Bachelor of Science (B.Sc.)', 'order' => 2, 'level' => 'ug', 'programme' => 'bsc',
            'excerpt' => 'A solid academic foundation in the biological and chemical sciences, with laboratory work across key disciplines.',
            'content' => snc_b_p('The B.Sc. programme provides a solid academic foundation in science and research. With well-equipped laboratories and experienced faculty, students gain both theoretical knowledge and hands-on experience across key science disciplines.')
                . snc_b_h('Programme highlights')
                . snc_b_ul(['Practical-based learning in the college laboratories.', 'Preparation for careers in teaching, research and technical fields.', 'Guest lectures, workshops and field visits.']),
            'meta' => [
                'snc_short_name'   => 'B.Sc.',
                'snc_duration'     => '3 years',
                'snc_pattern'      => 'Semester pattern',
                'snc_eligibility'  => '10+2 pass in the Science stream from a recognised board.',
                'snc_subjects'     => "Chemistry – Botany – Zoology",
                'snc_career_paths' => "Higher studies (M.Sc.)\nTeaching (after B.Ed.)\nLaboratory and research assistance\nCompetitive examinations\nHealth and environment sectors",
            ],
        ],
    ];
}

// --- Leadership -------------------------------------------------------------------------------

function snc_seed_leaders(): array {
    return [
        [
            'title' => 'Mr. Prashant Choubisa', 'order' => 1, 'designation' => 'Founder & Chairman, Pragati Sansthan',
            'excerpt' => 'At Shiv Narayan Choubisa College we strive to provide quality education, dedicated faculty and strong infrastructure to prepare students for success in their careers.',
            'content' => snc_b_p('India is among the fastest-growing economies in the world. This growth presents immense opportunities and responsibilities for today’s students to shape the nation’s future.')
                . snc_b_p('At Shiv Narayan Choubisa College (SNC), we strive to provide quality education, dedicated faculty and strong infrastructure to prepare students for success in their careers. Our aim is to help you develop a global perspective, embrace innovation and grow with the evolving demands of the world.')
                . snc_b_p('We look forward to welcoming you to SNC. May your journey here be enriching and empowering.'),
        ],
        [
            'title' => 'The Principal', 'order' => 2, 'designation' => 'Principal, Shiv Narayan Choubisa College, Simalwara',
            'excerpt' => 'Education must go beyond textbooks. Our goal is to equip students with strong foundational knowledge and a real-world perspective, so they face challenges with confidence.',
            'content' => snc_b_p('At Shiv Narayan Choubisa College, Simalwara, our commitment lies in delivering quality education in the fields of Arts and Science.')
                . snc_b_p('We believe that education must go beyond textbooks. Our goal is to equip students with strong foundational knowledge and a real-world perspective, empowering them to face challenges with confidence as they step into professional life.')
                . snc_b_p('Driven by our motto — the pursuit of excellence — we continue to invest in our infrastructure and a dedicated faculty team. Our mission is to guide students in unlocking their full potential and becoming responsible contributors to society and nation-building.')
                . snc_b_p('Wishing all our students a successful and meaningful journey ahead.'),
        ],
    ];
}

// --- Committees (names and purposes from the old site; members to be supplied) ---------------

function snc_seed_committees(): array {
    return [
        ['Anti-Ragging Committee', 'Prevents ragging and acts on complaints as per UGC regulations. Chairperson: Principal.'],
        ['Student Grievance Redressal Cell', 'Receives and resolves student grievances in a fair, confidential and time-bound manner.'],
        ['Mahila Prakoshth (Women’s Cell)', 'Works for the safety, rights and empowerment of girl students and women staff.'],
        ['Discipline Committee', 'Maintains discipline on campus and ensures a peaceful, respectful academic environment.'],
        ['Scholarship Committee', 'Handles scholarships such as Balika Protsahan Yojana, Samaj Kalyan, Minority Welfare and Mukhyamantri scholarships.'],
        ['Cultural & Picnic Committee', 'Organises cultural events, annual functions and student picnics.'],
        ['Literary Events Committee', 'Organises essay writing, debate, poetry and quiz competitions.'],
        ['Sports Committee', 'Conducts inter- and intra-college sports events and university games participation.'],
        ['Education Planner & Events Committee', 'Plans the academic calendar, guest lectures, workshops and seminars.'],
        ['Student Information & Press Committee', 'Manages student information, official notices and press communication.'],
        ['Library & Admission In-charges', 'Oversees the library and reading hall, and manages student enrolment.'],
    ];
}

// --- Pages (path => [title, subtitle, content]) — parents listed before children --------------

function snc_seed_pages(): array {
    return [
        'about' => ['About SNC', 'Shiv Narayan Choubisa College, Simalwara — established in 2005 by Pragati Sansthan, Dungarpur.',
            snc_b_h('Who we are')
            . snc_b_p('Shiv Narayan Choubisa College, Simalwara, was founded in 2005 under the leadership of Mr. Prashant Choubisa, President of Pragati Sansthan, which was established on 17 March 2004. The college is known for academic standards, discipline and a student-centred environment.')
            . snc_b_p('The college offers B.A. and B.Sc. programmes and is affiliated to Govind Guru Tribal University, Banswara. With experienced faculty and its own campus building, the college aims to nurture minds that make meaningful contributions to society. Our inclusive campus culture encourages critical thinking, creativity and character development.')
            . snc_b_h('At a glance')
            . snc_b_ul([
                'Established in 2005 by Pragati Sansthan, Dungarpur',
                'Affiliated to Govind Guru Tribal University (GGTU), Banswara',
                'Undergraduate programmes: B.A. and B.Sc.',
                'Study centre of Vardhman Mahaveer Open University (VMOU), Kota',
                // Not italicised: the Devanagari fallback fonts have no true italic and the
                // browser's synthesised slant is unreadable at body size.
                'Motto: <span lang="sa">तमसो मा ज्योतिर्गमय</span> — “Lead me from darkness to light”',
            ])],

        'about/pragati-sansthan' => ['Pragati Sansthan', 'The parent organisation of Shiv Narayan Choubisa College, established on 17 March 2004.',
            snc_b_p('Pragati Sansthan, Dungarpur was established on 17 March 2004 by Mr. Prashant Choubisa. The Sansthan runs educational institutions in Dungarpur district, including Shiv Narayan Choubisa College, Simalwara (2005) and Pragati College, Dungarpur (2006).')
            . snc_b_h('Milestones')
            . snc_b_table(['Year', 'Milestone'], [
                ['2001', 'Business Associate of IEC Software Ltd., New Delhi for a government computer-education project.'],
                ['2002', 'Accreditation of DOEACC Society, New Delhi for “O” Level courses.'],
                ['2005', 'Shiv Narayan Choubisa College, Simalwara started by Pragati Sansthan.'],
                ['2006', 'College opened at Dungarpur (Pragati College).'],
                ['2009', 'ISO 9001:2008 certification for institutions run by Pragati Sansthan.'],
                ['2010', 'Pragati Public School, an English-medium school, started at Simalwara.'],
                ['2012', 'Foundation laid for the college’s own building at Simalwara (26,000 sq. ft.).'],
                ['2014', 'VMOU, Kota study centre for distance education established at SNC College, Simalwara.'],
                ['2015', 'Authorised RKCL study centre started at SNC College, Simalwara.'],
            ])],

        'about/vision-mission' => ['Vision & Mission', 'The values that guide teaching and campus life at SNC College.',
            snc_b_h('Our vision')
            . snc_b_p('To become a respected institution known for academic excellence and societal impact — equipping students with knowledge and confidence to thrive in a changing world, guided by integrity and continuous growth.')
            . snc_b_h('Our mission')
            . snc_b_ul([
                '<strong>Empower through education:</strong> provide quality education that helps students become skilled and responsible individuals.',
                '<strong>Foster intellectual growth:</strong> support curiosity, creativity and critical thinking.',
                '<strong>Prepare for society:</strong> help students contribute meaningfully to society with values, leadership and lifelong learning.',
            ])
            . snc_b_h('Core values')
            . snc_b_p('The college is built on excellence, integrity and inclusion. We promote critical thinking, transparency and mutual respect, and blend new teaching methods with a strong sense of social responsibility.')
            . snc_b_h('Our philosophy')
            . snc_b_ul([
                '<strong>Academic excellence</strong> — quality education that empowers students.',
                '<strong>Holistic development</strong> — nurturing intellect and character through cultural, physical and emotional growth.',
                '<strong>Innovative learning</strong> — engaging, practical teaching methods.',
                '<strong>Inclusive environment</strong> — a safe and welcoming campus for every student.',
                '<strong>Social responsibility</strong> — outreach, community service and ethical leadership.',
                '<strong>Career readiness</strong> — skills and guidance for real-world challenges.',
            ])],

        'about/affiliations' => ['Affiliations', 'Universities with which the college is affiliated or associated.',
            snc_b_h('Govind Guru Tribal University, Banswara')
            . snc_b_p('Shiv Narayan Choubisa College is affiliated to Govind Guru Tribal University (GGTU), Banswara. Admissions, syllabus, examinations and degrees follow GGTU rules. Website: <a href="https://ggtu.ac.in">ggtu.ac.in</a>')
            . snc_b_h('Vardhman Mahaveer Open University, Kota')
            . snc_b_p('The college hosts a Distance Education Study Centre of Vardhman Mahaveer Open University (VMOU), Kota. Website: <a href="https://vmou.ac.in">vmou.ac.in</a>')],

        'about/infrastructure' => ['Infrastructure', 'A campus designed for learning and growth.',
            snc_b_p('The college functions from its own building at Simalwara (foundation laid in 2012, about 26,000 sq. ft.). Facilities are planned to provide a safe and focused learning environment.')
            . snc_b_h('Facilities at a glance')
            . snc_b_ul([
                '<strong>Library:</strong> textbooks, reference books, journals and a reading hall.',
                '<strong>Laboratories:</strong> Chemistry, Botany, Zoology and Geography labs for practical work.',
                '<strong>Computer lab:</strong> computer systems with internet access.',
                '<strong>Classrooms:</strong> comfortable classrooms with teaching aids.',
                '<strong>Sports:</strong> space for volleyball, cricket, badminton and athletics.',
                '<strong>Yoga and meditation:</strong> a calm space for yoga and relaxation.',
                '<strong>Drinking water and sanitation:</strong> RO drinking water and regularly maintained restrooms.',
                '<strong>First aid:</strong> basic first-aid support on campus.',
                '<strong>Wi-Fi:</strong> internet connectivity on campus.',
            ])],

        'about/mandatory-disclosures' => ['Mandatory Disclosures', 'Information disclosed by the college as required by regulatory bodies.',
            snc_b_p('The college is committed to transparency about its infrastructure, resources and facilities. Disclosure documents are listed below as they are published.')
            . snc_b_h('Laboratories')
            . snc_b_ul(['Science laboratories for Chemistry, Botany, Zoology and Geography.', 'Computer laboratory with licensed software for academic use.'])
            . snc_b_h('Connectivity')
            . snc_b_p('The campus has Wi-Fi internet connectivity for students and staff.')],

        'academics' => ['Academics', 'Undergraduate programmes in Arts and Science, affiliated to GGTU, Banswara.',
            snc_b_p('Shiv Narayan Choubisa College offers three-year undergraduate degree programmes in Arts (B.A.) and Science (B.Sc.) in the semester pattern. The syllabus, examinations and degrees are of Govind Guru Tribal University, Banswara.')
            . snc_b_p('Teaching combines classroom lectures with laboratory practicals, assignments, seminars, field visits and guest lectures.')],

        'academics/academic-calendar' => ['Academic Calendar', 'Teaching, examination and holiday schedule for each session.',
            snc_b_p('The academic calendar for each session is published below. It follows the calendar issued by Govind Guru Tribal University, Banswara.')],

        'academics/examinations' => ['Examinations', 'University examinations, forms and results.',
            snc_b_p('Semester examinations are conducted by Govind Guru Tribal University (GGTU), Banswara. Examination form schedules, admit cards, time tables and results are published by the university.')
            . snc_b_ul([
                'University website: <a href="https://ggtu.ac.in">ggtu.ac.in</a>',
                'Examination notices from the college are listed on the <a href="/students/notices?type=examination">Notices</a> page.',
            ])],

        'admissions' => ['Admissions', 'How to take admission to the B.A. and B.Sc. programmes at SNC College.',
            snc_b_h('Your path to admission')
            . snc_b_ul([
                '<strong>Fill the application form</strong> with accurate details.',
                '<strong>Attach the required documents</strong> — mark sheets, ID and photographs.',
                '<strong>Verification</strong> — the college verifies your documents.',
                '<strong>Confirmation</strong> — admission is confirmed and fees are deposited.',
            ], true, 'snc-steps')
            . snc_b_h('Eligibility')
            . snc_b_table(['Programme', 'Eligibility'], [
                ['B.A.', '10+2 pass from any recognised board in any stream.'],
                ['B.Sc.', '10+2 pass in the Science stream from a recognised board.'],
            ])
            . snc_b_h('Documents required at the time of admission')
            . snc_b_ul(['10th and 12th mark sheets', 'Transfer Certificate (TC)', 'Character Certificate', 'Migration Certificate (if applicable)', 'Caste Certificate (if applicable)', 'Passport-size photographs'])
            . snc_b_p('Admissions are made as per the rules of Govind Guru Tribal University, Banswara and the Government of Rajasthan. For the current session’s schedule, see <a href="/students/notices?type=admission">admission notices</a> or call the admission helpline.')],

        'admissions/apply' => ['How to Apply', 'Steps to apply for admission at SNC College.',
            snc_b_ul([
                'Check the eligibility for your programme on the <a href="/admissions">Admissions</a> page.',
                'Read the latest <a href="/students/notices?type=admission">admission notices</a> for the current session’s dates.',
                'Complete the admission form as instructed in the notice (online or at the college office).',
                'Submit the form with the required documents and keep a copy for your records.',
                'Check the <a href="/admissions/merit-lists">merit lists</a> and complete fee deposit and document verification on time.',
            ], true, 'snc-steps')
            . snc_b_p('Need help? Send an enquiry using the form below or call the admission helpline.')],

        'admissions/merit-lists' => ['Merit Lists', 'Merit, waiting and admitted lists by session, programme and category.',
            snc_b_p('Provisional and final lists are published here as soon as the college releases them. Select the session, programme and list type to find your list.')],

        'admissions/scholarships' => ['Scholarships', 'Government scholarship schemes available to eligible students.',
            snc_b_p('The college helps eligible students apply for scholarship schemes of the Government of Rajasthan and the Government of India, so that higher education is accessible and affordable for all.')
            . snc_b_h('Who can apply?')
            . snc_b_ul(['Scheduled Castes (SC)', 'Scheduled Tribes (ST)', 'Other Backward Classes (OBC)', 'Special Backward Classes (SBC)', 'Minority communities (Muslim, Sikh, Christian, Jain, Buddhist, Parsi)'])
            . snc_b_p('All scholarships are provided as per the rules and norms of the respective government departments.')
            . snc_b_h('Scholarship schemes')
            . snc_b_h('Post-Matric Scholarship (SC/ST/OBC/SBC)', 3)
            . snc_b_p('For students of SC, ST, OBC and SBC categories studying beyond class 10. Covers tuition, maintenance and other academic expenses. Provided by the Social Justice and Empowerment Department, Government of Rajasthan.')
            . snc_b_h('Central Minority Scholarship', 3)
            . snc_b_p('For students of minority communities pursuing higher education. Applications are made online through the National Scholarship Portal. Provided by the Ministry of Minority Affairs.')
            . snc_b_h('Tribal Girls’ Incentive Scheme', 3)
            . snc_b_p('An incentive for tribal girl students of Rajasthan to pursue college education, offered by the Tribal Area Development (TAD) Department. The form is collected and submitted at the college.')
            . snc_b_h('How to apply')
            . snc_b_ul([
                '<strong>Collect the application form</strong> from the college office or the department portal.',
                '<strong>Prepare documents:</strong> Aadhaar card, caste certificate, income certificate, bank passbook and mark sheets.',
                '<strong>Submit the form</strong> online on the government portal or at the college scholarship cell.',
                '<strong>Verification:</strong> the college verifies the documents and forwards the application to the department.',
            ], true, 'snc-steps')
            . snc_b_h('Frequently asked questions')
            . snc_b_p('<strong>Can I apply for more than one scholarship?</strong><br>No. A student can receive only one government-funded scholarship at a time.')
            . snc_b_p('<strong>What if I miss the deadline?</strong><br>Late applications are usually not accepted. Please follow the <a href="/students/notices?type=scholarship">scholarship notices</a>.')
            . snc_b_p('Official portal: <a href="https://sje.rajasthan.gov.in">sje.rajasthan.gov.in</a>')],

        'admissions/admission-kit' => ['Admission Kit & Dress Code', 'College uniform and items required after admission.',
            snc_b_h('Kit provided by the college')
            . snc_b_table(['Programme', 'Kit'], [
                ['B.A.', 'Pant and shirt (one each)'],
                ['B.Sc.', 'Pant, shirt and blazer (one each)'],
            ])
            . snc_b_h('To be brought by the student')
            . snc_b_ul(['Identity card', 'College bag'])
            . snc_b_h('Dress code rules')
            . snc_b_p('Students must wear the college uniform on all days except Wednesday and Thursday, when they may wear attire of their choice. Entry to the campus is allowed only in proper uniform on the prescribed days.')],

        'students' => ['Student Corner', 'Notices, syllabus, question papers, forms and student services in one place.',
            snc_b_p('This section brings together important academic information and services for students — notices, syllabus, previous year question papers, downloadable forms, migration assistance and support cells.')],

        'students/notices'         => ['Notices', 'Latest notices and circulars from the college.', snc_b_p('Notices are listed with the most recent first. Use the tabs to filter by type.')],
        'students/syllabus'        => ['Syllabus', 'Syllabus prescribed by Govind Guru Tribal University, Banswara.', snc_b_p('Download the syllabus for your programme and semester. The official syllabus is also available on the university website, <a href="https://ggtu.ac.in">ggtu.ac.in</a>.')],
        'students/question-papers' => ['Question Papers', 'Previous year university question papers.', snc_b_p('Previous year question papers help students understand the exam pattern, the types of questions asked and commonly covered topics.')],
        'students/downloads'       => ['Downloads', 'Forms and documents for students.', snc_b_p('Download forms and other documents. Submit completed forms at the college office unless the form says otherwise.')],

        'students/migration' => ['Migration Certificate', 'Applying for a migration certificate and contacting the nodal officer.',
            snc_b_p('Students who wish to move to another university or college can apply for a migration certificate through the college office.')
            . snc_b_h('Steps to apply')
            . snc_b_ul([
                'Collect the migration form from the college office.',
                'Submit it with a copy of your last mark sheet and college ID.',
                'Pay the applicable fee (if required).',
                'Collect your certificate after about 7 working days.',
                'Keep a copy of the form and receipt for future reference.',
            ], true)],

        'students/grievance-redressal' => ['Grievance Redressal', 'A fair, confidential and time-bound way to resolve student concerns.',
            snc_b_p('The Student Grievance Redressal Cell (SGRC) is constituted as per the guidelines of the University Grants Commission (UGC) to address students’ academic, administrative and personal concerns in a time-bound and transparent manner.')
            . snc_b_h('Objectives')
            . snc_b_ul(['Provide a mechanism for redressal of students’ complaints.', 'Ensure fair and impartial resolution in a confidential manner.', 'Strengthen student trust in institutional processes.', 'Promote open communication on campus.'])
            . snc_b_h('How to submit a grievance')
            . snc_b_p('Write to the college at <a href="mailto:sncdpr@gmail.com">sncdpr@gmail.com</a> or submit a written application at the college office. Grievances are responded to within 7 working days.')],

        'students/anti-ragging' => ['Anti-Ragging', 'A safe, respectful and ragging-free campus.',
            snc_b_p('Ragging in any form is strictly prohibited within or outside the college campus, as per the regulations of the University Grants Commission (UGC) and the directions of the Hon’ble Supreme Court of India. The college has constituted an Anti-Ragging Committee and conducts awareness programmes and takes student undertakings every session.')
            . snc_b_h('What is ragging?')
            . snc_b_ul(['Any act that causes physical or mental harm or fear', 'Humiliation or embarrassment', 'Harassment, abuse or forced tasks', 'Violation of personal dignity'])
            . snc_b_p('Ragging is a punishable offence and may result in suspension, rustication or legal action.')
            . snc_b_h('Report ragging')
            . snc_b_ul([
                'College helpline: <a href="tel:+919983005899">+91 99830 05899</a>, <a href="tel:+919414352319">+91 94143 52319</a>',
                'Email: <a href="mailto:sncdpr@gmail.com">sncdpr@gmail.com</a>',
                'National Anti-Ragging Helpline (UGC): <a href="tel:18001805522">1800-180-5522</a> · <a href="https://www.antiragging.in">antiragging.in</a>',
            ])
            . snc_b_h('Prevention measures')
            . snc_b_ul(['Orientation and awareness sessions', 'Anti-ragging posters across campus', 'Monitoring of common areas', 'Anonymous reporting for victims and witnesses', 'Immediate action on complaints as per UGC norms'])],

        'campus-life' => ['Campus Life', 'Learning beyond the classroom — NSS, Scout & Guide, sports and cultural activities.',
            snc_b_p('The college encourages students to take part in co-curricular and personality-building activities that develop communication, leadership and teamwork under the guidance of faculty.')
            . snc_b_h('National Service Scheme (NSS)')
            . snc_b_p('The NSS unit builds a spirit of voluntary service through tree plantation drives, cleanliness campaigns, health camps and awareness rallies on social issues.')
            . snc_b_h('Scout & Guide')
            . snc_b_p('The Scout & Guide unit promotes discipline, leadership and self-reliance through camps, flag ceremonies, disaster-preparedness training and social outreach.')
            . snc_b_h('Sports, cultural and literary activities')
            . snc_b_p('Students take part in sports, cultural programmes, annual functions, debates, essay writing, poetry and quiz competitions organised by the college committees.')],

        'campus-life/placement-cell' => ['Placement Cell', 'Career guidance, skill development and placement support.',
            snc_b_p('The Placement Cell bridges the gap between academics and employment. A team of faculty coordinators organises career guidance and skill development for students.')
            . snc_b_h('Key functions')
            . snc_b_ul(['Organising recruitment drives and coordinating interviews', 'Skill development sessions and pre-placement talks', 'Training in soft skills, aptitude and resume writing', 'Career counselling and guidance for higher education', 'Maintaining an alumni network for placement support'])],

        'campus-life/support-guidance' => ['Support & Guidance', 'Supporting students at every step.',
            snc_b_p('The college prioritises student well-being, career growth and a safe academic environment through dedicated cells.')
            . snc_b_h('Placement and career guidance')
            . snc_b_p('The cell prepares students for life after college through training sessions, resume-building workshops, career counselling and mock interviews.')
            . snc_b_h('Complaint and investigation cell')
            . snc_b_p('The cell addresses issues related to harassment, discrimination and academic grievances. Every complaint is treated with confidentiality and resolved through a fair and transparent process.')],

        'campus-life/videos' => ['Videos', 'Videos of events and activities at SNC College.',
            snc_b_p('Watch videos of college events and activities on our YouTube channel: <a href="https://www.youtube.com/@pragatiandsnccollege">youtube.com/@pragatiandsnccollege</a>')],

        'campus-life/alumni' => ['Alumni', 'Stay connected with SNC College.',
            snc_b_p('We are reconnecting with our alumni and would love to hear from you. Please fill the alumni registration form to join the SNC alumni network.')
            . snc_b_p('<a href="https://docs.google.com/forms/d/e/1FAIpQLSd7Ws2SKYK2Co7AGKNeFBGDscMBUjpOgPMdyG2hozsJJKCGXA/viewform">Alumni registration form</a>')],

        'iqac' => ['IQAC', 'Internal Quality Assurance Cell — the centre of quality enhancement at the college.',
            snc_b_p('The Internal Quality Assurance Cell (IQAC) is established as per the guidelines of the National Assessment and Accreditation Council (NAAC) and serves as the backbone of the college’s quality assurance and enhancement efforts.')
            . snc_b_h('Objectives')
            . snc_b_ul(['Develop a system for consistent action to improve academic and administrative performance.', 'Promote measures for quality enhancement in institutional functioning.', 'Integrate modern methods of teaching and learning.', 'Foster a culture of innovation and best practices.'])
            . snc_b_h('Functions')
            . snc_b_ul(['Developing and applying quality benchmarks', 'Organising workshops, seminars and training for faculty and staff', 'Collecting and analysing feedback from students, parents, alumni and stakeholders', 'Preparing the Self Study Report (SSR) for NAAC', 'Documenting institutional activities and outcomes', 'Monitoring the Annual Quality Assurance Report (AQAR)'])],

        'iqac/naac' => ['NAAC', 'The college’s preparation for assessment and accreditation by NAAC.',
            snc_b_p('The National Assessment and Accreditation Council (NAAC) is an autonomous body established by the University Grants Commission (UGC) to assess and accredit higher education institutions in India.')
            . snc_b_p('The college is working towards NAAC accreditation as part of its commitment to continuous improvement in teaching and learning, infrastructure, student support and governance.')
            . snc_b_h('Objectives')
            . snc_b_ul(['A learner-centric and value-based education system', 'Innovative teaching, learning and evaluation methods', 'Research, extension and outreach', 'Better infrastructure and student support services', 'Effective leadership and governance practices'])],

        'iqac/committees'     => ['Committees', 'College committees and cells, session-wise.', snc_b_p('The college functions through committees and cells headed by faculty members, which manage academic, cultural, disciplinary and welfare activities.')],
        'iqac/ugc-compliance' => ['UGC Compliance', 'Statutory and regulatory compliance documents.', snc_b_p('Documents related to UGC and other statutory bodies are published below.')],
        'iqac/reports'        => ['Reports', 'AQAR, AISHE and annual reports.', snc_b_p('Quality and statistical reports submitted by the college are published here, session-wise.')],

        'privacy-policy' => ['Privacy Policy', 'How this website handles your information.',
            snc_b_p('This website is operated by Shiv Narayan Choubisa College, Simalwara.')
            . snc_b_h('Information we collect')
            . snc_b_p('When you submit the enquiry form, we collect the details you provide — your name, mobile number, email address (optional), programme of interest and message.')
            . snc_b_h('How we use it')
            . snc_b_p('We use these details only to respond to your enquiry about admissions and college services. We do not sell or share your information with third parties for marketing.')
            . snc_b_h('Contact')
            . snc_b_p('For any question about your information, write to <a href="mailto:sncdpr@gmail.com">sncdpr@gmail.com</a>.')],
    ];
}
