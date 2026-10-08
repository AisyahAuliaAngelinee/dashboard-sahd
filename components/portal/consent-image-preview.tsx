import type {Consent} from '@/lib/consent';
import ConsentDocument from './consent-document';

export default function ConsentImagePreview({data}:{data:Consent}) {
  return (
    <div className="consent-image-preview consent-document-preview" aria-label={`Medical Consent Form — ${data.patientName}`}>
      <ConsentDocument data={data}/>
    </div>
  );
}
