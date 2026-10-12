import Button from '@/components/ui/Button';
import Section, { type SectionTone } from '@/components/ui/Section';
import SectionHeader from '@/components/ui/SectionHeader';
import type { Notice, Settings } from '@/lib/wp/types';
import NoticeBoard from './NoticeBoard';

/** About text + facts (left) and notice board (right) — design system §6.1 section 3. */
export default function AboutIntro({ settings, notices, tone }: { settings: Settings; notices: Notice[]; tone: SectionTone }) {
  const paragraphs = settings.about_body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <Section tone={tone} labelledBy="about-heading">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <SectionHeader
            id="about-heading"
            eyebrow={settings.about_eyebrow || 'About SNC'}
            title={settings.about_heading || settings.college_name || 'Shiv Narayan Choubisa College'}
            className="mb-6 md:mb-8"
          />
          <div className="max-w-prose space-y-4 text-base leading-7 text-ink-700">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>

          {settings.facts.length > 0 && (
            <dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-ink-200 pt-8">
              {settings.facts.map((f) => (
                <div key={f.label} className="flex flex-col border-l-2 border-gold-500 pl-4">
                  <dt className="text-sm text-ink-500">{f.label}</dt>
                  <dd className="order-first mt-1 font-serif text-xl font-bold text-primary-900 md:text-2xl">{f.value}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-10">
            <Button href="/about" variant="outline">
              Read more about SNC
            </Button>
          </div>
        </div>

        <div className="lg:col-span-5">
          <NoticeBoard notices={notices} />
        </div>
      </div>
    </Section>
  );
}
