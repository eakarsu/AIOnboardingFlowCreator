import React from 'react';

const shimmerStyle = `
  @keyframes shimmer {
    0% { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
`;

const SkeletonBox = ({ width = '100%', height = 16, borderRadius = 6, style = {} }) => (
  <div style={{
    width,
    height,
    borderRadius,
    background: 'linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%)',
    backgroundSize: '800px 100%',
    animation: 'shimmer 1.5s ease-in-out infinite',
    ...style
  }} />
);

export const TableSkeleton = ({ rows = 5, columns = 4 }) => (
  <>
    <style>{shimmerStyle}</style>
    <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 16, padding: '14px 16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonBox key={i} width={`${100 / columns}%`} height={12} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} style={{ display: 'flex', gap: 16, padding: '14px 16px', borderBottom: '1px solid #f1f5f9' }}>
          {Array.from({ length: columns }).map((_, colIdx) => (
            <SkeletonBox key={colIdx} width={`${100 / columns}%`} height={14} />
          ))}
        </div>
      ))}
    </div>
  </>
);

export const CardSkeleton = ({ count = 4 }) => (
  <>
    <style>{shimmerStyle}</style>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <SkeletonBox width={120} height={14} />
            <SkeletonBox width={48} height={48} borderRadius={12} />
          </div>
          <SkeletonBox width={80} height={28} style={{ marginBottom: 8 }} />
          <SkeletonBox width={100} height={12} />
        </div>
      ))}
    </div>
  </>
);

export const DashboardSkeleton = () => (
  <>
    <style>{shimmerStyle}</style>
    <div>
      <SkeletonBox width={200} height={28} style={{ marginBottom: 8 }} />
      <SkeletonBox width={300} height={16} style={{ marginBottom: 32 }} />
      <CardSkeleton count={4} />
      <div style={{ marginTop: 32 }}>
        <SkeletonBox width={500} height={100} borderRadius={16} />
      </div>
    </div>
  </>
);

export default SkeletonBox;
