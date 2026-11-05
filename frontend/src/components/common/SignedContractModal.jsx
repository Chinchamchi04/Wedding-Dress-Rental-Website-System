import { useEffect, useState } from 'react';
import { Button, Modal } from 'antd';
import { ExternalLink, FileSignature, FileText } from 'lucide-react';
import { getOrder } from '../../services/customerOrderService';
import { getSignedContract } from '../../utils/signedContract';

export default function SignedContractModal({ orderId, onClose }) {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setOrder(null);
    getOrder(orderId)
      .then((value) => { if (active) setOrder(value); })
      .catch((issue) => { if (active) setError(issue.message || 'Không tải được hợp đồng. Vui lòng thử lại.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [orderId, retry]);

  const saved = getSignedContract(order);
  return (
    <Modal
      open
      title={<span className="flex items-center gap-2"><FileSignature size={19} /> Xem hợp đồng đã ký</span>}
      width={900}
      onCancel={onClose}
      footer={<Button onClick={onClose}>Đóng</Button>}
    >
      <div className="max-h-[65vh] overflow-y-auto py-3 pr-2">
        {loading ? (
          <p role="status" className="py-12 text-center text-stone-500">Đang tải hợp đồng đã lưu...</p>
        ) : error ? (
          <div role="alert" className="rounded-xl bg-red-50 p-4 text-red-800">
            <p>{error}</p>
            <Button className="mt-3" onClick={() => setRetry((value) => value + 1)}>Thử lại</Button>
          </div>
        ) : (
          <div className="space-y-5">
            <dl className="grid grid-cols-1 gap-3 rounded-xl border border-[#EEDECF] bg-[#FFF8F6] p-4 text-sm sm:grid-cols-2">
              <div><dt className="text-stone-500">Mã đơn thuê</dt><dd className="font-semibold">{order?.orderCode || orderId}</dd></div>
              <div><dt className="text-stone-500">Mã hợp đồng</dt><dd className="font-semibold">{saved.code || 'Chưa được lưu'}</dd></div>
              {saved.name && <div className="sm:col-span-2"><dt className="text-stone-500">Tên hợp đồng</dt><dd>{saved.name}</dd></div>}
              {saved.signedAt && <div><dt className="text-stone-500">Ngày ký</dt><dd>{new Date(saved.signedAt).toLocaleString('vi-VN')}</dd></div>}
              {saved.signedMethod && <div><dt className="text-stone-500">Hình thức ký</dt><dd>{saved.signedMethod}</dd></div>}
            </dl>

            {saved.pendingSignature ? (
              <p role="status" className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Hợp đồng này đang chờ ký, chưa có bản hợp đồng đã ký để xem.</p>
            ) : !saved.hasRecord ? (
              <p role="status" className="rounded-xl bg-stone-50 p-4 text-sm text-stone-600">Đơn thuê chưa có thông tin hợp đồng đã ký được lưu trên hệ thống.</p>
            ) : (
              <>
                {saved.fileUrl && (
                  <a href={saved.fileUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[#874e57] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#703e47]">
                    <ExternalLink size={16} /> Mở file hợp đồng đã lưu
                  </a>
                )}
                {saved.clauses.length > 0 && (
                  <section aria-label="Nội dung hợp đồng đã lưu" className="space-y-5 rounded-xl border border-[#EEDECF] bg-white p-5">
                    <h3 className="flex items-center gap-2 font-playfair text-xl"><FileText size={18} /> Nội dung hợp đồng đã lưu</h3>
                    {saved.clauses.map((clause, index) => (
                      <article key={`${clause.id || index}-${index}`} className="space-y-2 text-sm leading-6">
                        {clause.title && <h4 className="font-semibold">{clause.title}</h4>}
                        <p className="whitespace-pre-wrap">{clause.content}</p>
                      </article>
                    ))}
                  </section>
                )}
                {!saved.hasDocument && <p role="status" className="rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">Đơn này chưa có file hoặc nội dung hợp đồng đã ký đính kèm. Nàng vui lòng liên hệ showroom để nhận bản hợp đồng đã ký.</p>}
                {saved.signature && (
                  <section className="rounded-xl border border-[#EEDECF] p-4" aria-label="Chữ ký lưu trên đơn thuê">
                    <h3 className="mb-3 font-semibold">Chữ ký lưu trên đơn thuê</h3>
                    {saved.signatureIsImage
                      ? <img src={saved.signature} alt="Chữ ký đã lưu" className="max-h-40 max-w-full object-contain" />
                      : <p className="whitespace-pre-wrap font-serif text-xl italic">{saved.signature}</p>}
                  </section>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
