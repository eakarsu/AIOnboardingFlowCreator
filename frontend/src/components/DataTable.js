import React, { useState } from 'react';
import { Plus, Search, ChevronLeft, ChevronRight, X, Loader, Edit2, Trash2, Download } from 'lucide-react';
import { TableSkeleton } from './Skeleton';

const Modal = ({ isOpen, onClose, title, children, onSubmit, loading }) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000
        }}
        onClick={onClose}
      />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        borderRadius: 16,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: 500,
        maxHeight: '90vh',
        overflow: 'auto',
        zIndex: 1001
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: 4
            }}
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div style={{ padding: 24 }}>
            {children}
          </div>
          <div style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'flex-end',
            padding: '16px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc'
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                color: '#64748b',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                background: loading ? '#94a3b8' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                borderRadius: 8,
                color: 'white',
                fontSize: 14,
                fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              {loading && <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              Save
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};

const DetailPanel = ({ isOpen, onClose, title, data, fields, onEdit, onDelete }) => {
  if (!isOpen || !data) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 1000
        }}
        onClick={onClose}
      />
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white',
        borderRadius: 16,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        width: '100%',
        maxWidth: 550,
        maxHeight: '85vh',
        overflow: 'auto',
        zIndex: 1001
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          background: 'white',
          zIndex: 1
        }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b' }}>{title}</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: 4
            }}
          >
            <X size={20} />
          </button>
        </div>
        <div style={{ padding: 24 }}>
          {fields.map((field) => (
            <div key={field.key} style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 500,
                color: '#64748b',
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {field.label}
              </label>
              <div style={{
                fontSize: 14,
                color: '#1e293b',
                padding: '10px 12px',
                background: '#f8fafc',
                borderRadius: 8,
                border: '1px solid #e2e8f0',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap'
              }}>
                {field.render ? field.render(data[field.key], data) : (
                  typeof data[field.key] === 'object'
                    ? JSON.stringify(data[field.key], null, 2)
                    : String(data[field.key] ?? '-')
                )}
              </div>
            </div>
          ))}
        </div>
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12
        }}>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this item?')) {
                onDelete && onDelete(data);
                onClose();
              }
            }}
            style={{
              padding: '10px 20px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              color: '#dc2626',
              fontSize: 14,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}
          >
            <Trash2 size={16} />
            Delete
          </button>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                color: '#64748b',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Close
            </button>
            <button
              onClick={() => {
                onEdit && onEdit(data);
                onClose();
              }}
              style={{
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                borderRadius: 8,
                color: 'white',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}
            >
              <Edit2 size={16} />
              Edit
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const DataTable = ({
  title,
  data,
  columns,
  loading,
  onRowClick,
  onAdd,
  addButtonText = 'Add New',
  searchable = true,
  detailFields = [],
  FormComponent,
  onSubmit,
  onUpdate,
  onDelete,
  onExportCSV,
  onExportPDF,
  emptyIcon: EmptyIcon
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const itemsPerPage = 10;

  const filteredData = data.filter((item) =>
    Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const handleRowClick = (item) => {
    if (onRowClick) {
      onRowClick(item);
    } else if (detailFields.length > 0) {
      setSelectedItem(item);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (isEditing && onUpdate) {
        await onUpdate(formData.id, formData);
      } else if (onSubmit) {
        await onSubmit(formData);
      }
      setShowForm(false);
      setFormData({});
      setIsEditing(false);
    } catch (error) {
      console.error('Form submit error:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (item) => {
    if (onDelete) {
      try {
        await onDelete(item.id);
      } catch (error) {
        console.error('Delete error:', error);
      }
    }
  };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 16
      }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b' }}>{title}</h1>
        <div style={{ display: 'flex', gap: 12 }}>
          {searchable && (
            <div style={{ position: 'relative' }}>
              <Search
                size={18}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8'
                }}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '10px 12px 10px 40px',
                  border: '1px solid #e2e8f0',
                  borderRadius: 8,
                  fontSize: 14,
                  width: 220,
                  outline: 'none'
                }}
              />
            </div>
          )}
          {(onExportCSV || onExportPDF) && (
            <div style={{ display: 'flex', gap: 4 }}>
              {onExportCSV && (
                <button
                  onClick={async () => {
                    try {
                      const res = await onExportCSV();
                      const url = window.URL.createObjectURL(new Blob([res.data]));
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.csv`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    } catch (e) { console.error('Export error:', e); }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0',
                    borderRadius: 8, color: '#166534', fontSize: 13, fontWeight: 500, cursor: 'pointer'
                  }}
                >
                  <Download size={14} /> CSV
                </button>
              )}
              {onExportPDF && (
                <button
                  onClick={async () => {
                    try {
                      const res = await onExportPDF();
                      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `${title.replace(/\s+/g, '_').toLowerCase()}.pdf`;
                      a.click();
                      window.URL.revokeObjectURL(url);
                    } catch (e) { console.error('Export error:', e); }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca',
                    borderRadius: 8, color: '#991b1b', fontSize: 13, fontWeight: 500, cursor: 'pointer'
                  }}
                >
                  <Download size={14} /> PDF
                </button>
              )}
            </div>
          )}
          {(onAdd || FormComponent) && (
            <button
              onClick={() => {
                if (FormComponent) {
                  setFormData({});
                  setIsEditing(false);
                  setShowForm(true);
                } else if (onAdd) {
                  onAdd();
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 20px',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none',
                borderRadius: 8,
                color: 'white',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              <Plus size={18} />
              {addButtonText}
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{
        background: 'white',
        borderRadius: 12,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {loading ? (
          <TableSkeleton rows={5} columns={columns.length} />
        ) : paginatedData.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 60,
            color: '#64748b'
          }}>
            {EmptyIcon && <EmptyIcon size={48} style={{ marginBottom: 16, opacity: 0.3 }} />}
            <p style={{ fontSize: 16, fontWeight: 500 }}>No items found</p>
            <p style={{ fontSize: 14, marginTop: 4 }}>
              {searchQuery ? 'Try adjusting your search' : 'Add your first item to get started'}
            </p>
          </div>
        ) : (
          <>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      style={{
                        textAlign: 'left',
                        padding: '14px 16px',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}
                    >
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((item, index) => (
                  <tr
                    key={item.id || index}
                    onClick={() => handleRowClick(item)}
                    style={{
                      borderBottom: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        style={{
                          padding: '14px 16px',
                          fontSize: 14,
                          color: '#1e293b'
                        }}
                      >
                        {column.render
                          ? column.render(item[column.key], item)
                          : item[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 16px',
                borderTop: '1px solid #e2e8f0',
                background: '#f8fafc'
              }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>
                  Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length}
                </span>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: '6px 12px',
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: 6,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      opacity: currentPage === 1 ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span style={{
                    padding: '6px 12px',
                    background: '#6366f1',
                    color: 'white',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 500
                  }}>
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '6px 12px',
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: 6,
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Panel */}
      <DetailPanel
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        title="Details"
        data={selectedItem}
        fields={detailFields}
        onEdit={FormComponent ? handleEdit : null}
        onDelete={onDelete ? handleDelete : null}
      />

      {/* Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setFormData({});
          setIsEditing(false);
        }}
        title={isEditing ? 'Edit Item' : addButtonText}
        onSubmit={handleFormSubmit}
        loading={formLoading}
      >
        {FormComponent && (
          <FormComponent
            data={formData}
            onChange={setFormData}
          />
        )}
      </Modal>
    </div>
  );
};

export { DataTable, Modal, DetailPanel };
export default DataTable;
