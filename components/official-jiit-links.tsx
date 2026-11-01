import type { Section } from "./jt-navigation";

type OfficialLink = { title: string; description: string; href: string };

const links: Partial<Record<Section, OfficialLink[]>> = {
  academics: [
    { title: "Academic calendars", description: "Published academic calendars for the current and previous sessions.", href: "https://www.jiit.ac.in/academics/academic-calendars" },
    { title: "Academic system and ordinances", description: "Official programme structure, academic rules and curriculum entry points.", href: "https://www.jiit.ac.in/academics/academic-system-ordinances" },
    { title: "Electronics and Computer Engineering curriculum", description: "Official programme page and curriculum details for ECM students; verify the admission-year version.", href: "https://www.jiit.ac.in/prospective-student/ug-programmes/b-tech/b-tech-in-electronics-and-computer-engineering" },
  ],
  exams: [
    { title: "Academic calendars", description: "Use the published calendar as the source of truth for academic dates.", href: "https://www.jiit.ac.in/academics/academic-calendars" },
    { title: "Latest announcements", description: "Official examination notices, schedules, forms and student instructions.", href: "https://www.jiit.ac.in/latest-announcements" },
  ],
  placements: [
    { title: "Student placement information", description: "Official placement highlights and training-and-placement information. Figures are batch-specific and may be updated.", href: "https://www.jiit.ac.in/existing-student/training-and-placement/students-placement" },
  ],
  campus: [
    { title: "Campus facilities FAQ", description: "Official answers about facilities, transport, hostels and campus access.", href: "https://www.jiit.ac.in/faq?type=Campus+Facilities" },
    { title: "Campus contact details", description: "Official addresses and contact channels for Sector 62 and Sector 128.", href: "https://www.jiit.ac.in/contact-us" },
  ],
};

export function OfficialJiitLinks({ section }: { section: Section }) {
  const items = links[section];
  if (!items?.length) return null;

  return (
    <section className="jt-source-panel" aria-labelledby="official-jiit-links-title">
      <div className="jt-source-heading">
        <div>
          <span className="jt-kicker">PRIMARY SOURCES · JIIT</span>
          <h2 id="official-jiit-links-title">Verify details at the source.</h2>
        </div>
        <p>These links open official JIIT pages. Content can change; check the page and its publication date before relying on a detail.</p>
      </div>
      <div className="jt-grid jt-two">
        {items.map((item) => (
          <article className="jt-resource" key={item.href}>
            <h3>{item.title}</h3>
            <p>{item.description}</p>
            <div className="jt-source-footer">
              <span className="jt-pill">Official JIIT source</span>
              <a href={item.href} target="_blank" rel="noopener noreferrer">Open official page ↗</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
