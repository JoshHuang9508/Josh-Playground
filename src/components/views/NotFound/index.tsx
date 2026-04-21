import useI18n from '@/lib/hooks/i18n';
import useTerminalCommand from '@/lib/hooks/TerminalCommand';

import ColorSpan from '@/components/ColorSpan';

export default function NotFoundView() {
  const { t } = useI18n();

  useTerminalCommand({});

  return (
    <div className={'content-div'}>
      <ColorSpan str={t('notfound.error', window.location.hash.slice(1))} />
    </div>
  );
}
