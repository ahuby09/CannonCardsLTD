import { useEffect, useMemo } from 'react';

export function orderCodes(order) {
  return (order?.items || []).flatMap((item) =>
    (item.delivered_codes || []).map((code) => ({
      product: item.product_snapshot_name,
      code
    }))
  );
}

function createDownloadUrl(order, codes) {
  if (!codes.length) return null;

  const text = [
    `Order #${order.id} Pokemon TCG Live codes`,
    '',
    ...codes.map((item) => `${item.product}: ${item.code}`)
  ].join('\n');

  return URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
}

export default function OrderCodeDelivery({ order }) {
  const codes = useMemo(() => orderCodes(order), [order]);
  const downloadUrl = useMemo(() => createDownloadUrl(order, codes), [order, codes.length]);

  useEffect(() => () => {
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
  }, [downloadUrl]);

  if (!codes.length) return null;

  return (
    <div className="code-delivery">
      <h3>Your digital codes</h3>
      <p>Save these codes now. Each code can only be redeemed once.</p>
      {codes.map((item) => (
        <div className="delivered-code" key={`${item.product}-${item.code}`}>
          <span>{item.product}</span>
          <code>{item.code}</code>
        </div>
      ))}
      <a className="button secondary" href={downloadUrl} download={`order-${order.id}-pokemon-codes.txt`}>Download codes.txt</a>
    </div>
  );
}

export function hasCodeCardItems(order) {
  return order?.items?.some((item) => item.product_type === 'code_card');
}
