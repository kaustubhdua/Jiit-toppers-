import { BookOpen, BriefcaseBusiness, Building2, CalendarDays, Calculator, GraduationCap, Library, MapPin, ShieldCheck, Users, type LucideIcon } from 'lucide-react';
import type { Section } from './jt-navigation';
import { AcademicCalculators } from './academic-calculators';
import { PyqDiscovery } from './pyq-discovery';

type WorkspaceSection = Exclude<Section, 'home'>;
type WorkspaceCard = { title: string; body: string; icon: LucideIcon };

const descriptions: Record<WorkspaceSection, { eyebrow: string; title: string; lead: string; cards: WorkspaceCard[] }> = {
  academics: { eyebrow: 'ACADEMICS', title: 'Academic Explorer', lead: 'Explore your programme, curriculum and courses. Connect a verified curriculum before relying on course details.', cards: [{title:'Programme & curriculum',body:'Programme, branch, admission batch and curriculum version.',icon:GraduationCap},{title:'Attendance planner',body:'Estimate attendance scenarios from your own inputs; no institutional attendance is connected.',icon:Calculator},{title:'Timetable',body:'A workspace for your class schedule once you add or connect your timetable.',icon:CalendarDays}] },
  resources: { eyebrow: 'STUDY VAULT', title: 'Study smarter.', lead: 'Start from existing academic resources and keep source ownership visible. JIIT Toppers links to external archives rather than republishing their content without permission.', cards: [{title:'Notes & tutorials',body:'A future resource directory organised by programme, semester and subject.',icon:BookOpen},{title:'Previous-year papers',body:'Open the existing PYQJIIT archive and browse by year and branch.',icon:Library},{title:'Resource verification',body:'Future contributions must show source, contributor and review status.',icon:ShieldCheck}] },
  exams: { eyebrow: 'EXAM CENTER', title: 'Prepare with context.', lead: 'Bring schedules, syllabus coverage and past papers into one preparation workflow.', cards: [{title:'Exam schedule',body:'Display dates and rooms only when backed by a published source.',icon:CalendarDays},{title:'PYQ history',body:'Track topics that appeared in available past papers; avoid unsupported predictions.',icon:BookOpen},{title:'Grade planner',body:'Model possible marks and outcomes without presenting estimates as official grades.',icon:Calculator}] },
  placements: { eyebrow: 'CAREER', title: 'Placement Archive', lead: 'A structured collection for company information, preparation resources and student experiences.', cards: [{title:'Company directory',body:'Separate official recruiter information from community submissions.',icon:BriefcaseBusiness},{title:'Interview experiences',body:'Student-submitted experiences with moderation and dates.',icon:Users},{title:'Preparation',body:'Organise OA practice, interview topics and resume resources.',icon:BookOpen}] },
  campus: { eyebrow: 'CAMPUS', title: 'Know your campus.', lead: 'Campus information for Sector 62 and Sector 128, with clear source and freshness labels.', cards: [{title:'Shuttle & routes',body:'Publish route information only after its source and validity are checked.',icon:MapPin},{title:'Library & study spaces',body:'Collect location and access information with last-verified dates.',icon:Library},{title:'Facilities',body:'Campus utilities and facility directory.',icon:Building2}] },
  community: { eyebrow: 'COMMUNITY', title: 'Students helping students.', lead: 'Student-led spaces for collaboration, questions and events, with moderation built in.', cards: [{title:'Team finder',body:'Find collaborators for projects and hackathons.',icon:Users},{title:'Discussions',body:'Ask course questions and share useful answers.',icon:BookOpen},{title:'Clubs & events',body:'Discover student activities and campus events.',icon:CalendarDays}] },
};

export function JTWorkspace({ section, query }: { section: WorkspaceSection; query: string }) {
  const page = descriptions[section];
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const cards = page.cards.filter(card => !normalizedQuery || `${card.title} ${card.body}`.toLocaleLowerCase().includes(normalizedQuery));
  return <section className="jt-page"><span className="jt-kicker">{page.eyebrow}</span><h1>{page.title}</h1><p className="jt-lead">{page.lead}</p>
    {normalizedQuery && <p role="status" className="jt-lead" style={{fontSize:13}}>Showing {cards.length} matching workspace item{cards.length === 1 ? '' : 's'}.</p>}
    {cards.length ? <div className="jt-grid jt-three">{cards.map(({title,body,icon:Icon})=><article className="jt-card" key={title}><Icon size={22}/><h3>{title}</h3><p>{body}</p><span className="jt-pill">{section === 'resources' && title === 'Previous-year papers' ? 'External source' : 'Planned / foundation'}</span></article>)}</div> : <div className="jt-card" role="status"><h3>No matching items</h3><p>Try a different search term.</p></div>}
    {section === 'academics' && <AcademicCalculators />}
    {section === 'resources' && <PyqDiscovery />}
    {section !== 'resources' && <p className="jt-lead" style={{fontSize:13,marginTop:24}}>This workspace is still being built. Do not treat its placeholder cards as live JIIT services or official records.</p>}
  </section>;
}
