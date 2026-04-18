import { t } from '@/lib/i18n';

import useTerminalCommand from '@/lib/hooks/TerminalCommand';

import ColorSpan from '@/components/ColorSpan';

export default function NotFoundView() {
  useTerminalCommand({});

  return (
    <div className={'content-div'}>
      <div className={'container1'}>
        <div className="sub-container2" style={{ fontFamily: 'monospace' }}>
          <div>
            <ColorSpan str={t('notfound.error', window.location.hash.slice(1))} />
          </div>
        </div>
      </div>
    </div>
  );
}
