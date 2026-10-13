"""Bundle the landing page's existing assets without changing execution order.

Run after editing CSS or classic scripts. Source files and vendor licenses remain
in the project; desktop ES modules continue to load on demand.
"""
from pathlib import Path

root = Path(__file__).resolve().parents[1] / 'v2'
styles = ['redesign.css', 'editorial.css', 'pressure-hook.css',
          'profile-story.css', 'skills-story.css', 'mobile.css', 'refinement.css', 'hero-sequence.css']
scripts = ['vendor/gsap/gsap.min.js', 'vendor/gsap/ScrollTrigger.min.js',
           'redesign.js', 'profile-story.js', 'skills-story.js', 'visual-runtime.js', 'refinement.js', 'hero-sequence.js']

for target, sources, separator in [('landing.css', styles, '\n'),
                                    ('landing.js', scripts, '\n;\n')]:
    (root / target).write_text(separator.join(
        f'/* Source: {source} */\n{(root / source).read_text()}' for source in sources
    ) + '\n')
    print(f'{target}: {len(sources)} source files')
