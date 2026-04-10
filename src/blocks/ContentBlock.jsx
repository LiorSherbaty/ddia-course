import TextBlock from './TextBlock'
import SubheadingBlock from './SubheadingBlock'
import InterviewQuoteBlock from './InterviewQuoteBlock'
import SayBlock from './SayBlock'
import DontBlock from './DontBlock'
import CalloutBlock from './CalloutBlock'
import RadworkBlock from './RadworkBlock'
import ListBlock from './ListBlock'
import NumberedListBlock from './NumberedListBlock'
import TableBlock from './TableBlock'
import CodeBlock from './CodeBlock'
import MentalModelBlock from './MentalModelBlock'
import TradeOffBlock from './TradeOffBlock'
import FollowUpBlock from './FollowUpBlock'
import RedFlagBlock from './RedFlagBlock'
import LevelUpBlock from './LevelUpBlock'
import EchoBlock from './EchoBlock'

function CodeBlockAdapter({ block }) {
  return <CodeBlock lang={block.lang} code={block.code} label={block.label} />
}

const REGISTRY = {
  text: TextBlock,
  subheading: SubheadingBlock,
  'interview-quote': InterviewQuoteBlock,
  say: SayBlock,
  dont: DontBlock,
  callout: CalloutBlock,
  radwork: RadworkBlock,
  list: ListBlock,
  'numbered-list': NumberedListBlock,
  table: TableBlock,
  code: CodeBlockAdapter,
  'mental-model': MentalModelBlock,
  'trade-off': TradeOffBlock,
  'follow-up': FollowUpBlock,
  'red-flag': RedFlagBlock,
  'level-up': LevelUpBlock,
  echo: EchoBlock,
}

export default function ContentBlock({ block, dayId }) {
  const Component = REGISTRY[block.type]
  if (!Component) return null
  return <Component block={block} dayId={dayId} />
}
