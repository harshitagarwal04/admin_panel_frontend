import { Layout } from '@/components/layout/Layout';

export default function CallIQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Layout>{children}</Layout>;
}