import React from 'react';

import { t } from '@/lib/i18n';

import useCommandHandler from '@/lib/hooks/CommandHandler';

import ColorSpan from '@/components/ColorSpan';

export default function NotFoundView() {
  useCommandHandler({});

  return (
    <div className={'content-div'}>
      <div className={'container1'}>
        <div className="sub-container2" style={{ fontFamily: 'monospace' }}>
          <div>
            <ColorSpan str={t('*.error')} />
          </div>
        </div>
      </div>
    </div>
  );
}
