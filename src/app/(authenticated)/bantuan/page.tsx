import { CrisisScreen } from '@/components/crisis/CrisisScreen';
import { getActiveHotlines } from '@/lib/actions/crisis';

interface SearchParams {
  source?: string;
  severity?: string;
}

export default async function BantuanPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const hotlines = await getActiveHotlines();

  const triggerSource =
    params.source === 'bot' ? 'bot_keyword'
    : params.source === 'pattern' ? 'mood_pattern_3day'
    : 'manual_button';

  const severity =
    params.severity === 'high' ? 'high'
    : params.severity === 'medium' ? 'medium'
    : 'low';

  return (
    <CrisisScreen
      hotlines={hotlines}
      triggerSource={triggerSource}
      severity={severity}
    />
  );
}
