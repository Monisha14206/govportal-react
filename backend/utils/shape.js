// These helpers flatten a Mongoose Application/Complaint document (with
// `service`/`user` populated) into the same flat JSON shape the frontend
// has always consumed - e.g. `service_name`, `applicant_name` - so none of
// the React code needs to change just because the data now lives in
// MongoDB instead of SQLite.

// Mongo Date fields serialize to raw ISO strings (`2026-06-24T11:30:00.000Z`)
// by default. The frontend just renders these as plain text, so format them
// the same readable way the old SQLite `datetime('now')` columns were.
function fmtDate(d) {
  if (!d) return d;
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toISOString().replace('T', ' ').slice(0, 19);
}

function shapeHistory(historyArr) {
  return (historyArr || []).map(h => ({
    id: h._id ? h._id.toString() : undefined,
    status: h.status,
    remarks: h.remarks,
    created_at: fmtDate(h.created_at)
  }));
}

function shapeApplication(doc) {
  const o = doc.toObject({ virtuals: true });
  return {
    id: o.id,
    application_number: o.application_number,
    service_id: (o.service && o.service.id) || o.service,
    service_name: o.service && o.service.name,
    applicant_name: o.user && o.user.name,
    applicant_email: o.user && o.user.email,
    applicant_phone: o.user && o.user.phone,
    form_data: o.form_data,
    documents: o.documents,
    status: o.status,
    remarks: o.remarks,
    created_at: fmtDate(o.created_at),
    updated_at: fmtDate(o.updated_at)
  };
}

function shapeComplaint(doc) {
  const o = doc.toObject({ virtuals: true });
  return {
    id: o.id,
    complaint_number: o.complaint_number,
    category: o.category,
    subject: o.subject,
    description: o.description,
    location: o.location,
    attachment_path: o.attachment_path,
    complainant_name: o.user && o.user.name,
    complainant_email: o.user && o.user.email,
    status: o.status,
    remarks: o.remarks,
    created_at: fmtDate(o.created_at),
    updated_at: fmtDate(o.updated_at)
  };
}

function shapeSchemeApplication(doc) {
  const o = doc.toObject({ virtuals: true });
  return {
    id: o.id,
    application_number: o.application_number,
    scheme_id: (o.scheme && o.scheme.id) || o.scheme,
    scheme_name: o.scheme && o.scheme.name,
    applicant_name: o.user && o.user.name,
    applicant_email: o.user && o.user.email,
    applicant_phone: o.user && o.user.phone,
    form_data: o.form_data,
    documents: o.documents,
    status: o.status,
    remarks: o.remarks,
    created_at: fmtDate(o.created_at),
    updated_at: fmtDate(o.updated_at)
  };
}

function shapeNotification(doc) {
  const o = doc.toObject({ virtuals: true });
  return {
    id: o.id,
    channel: o.channel,
    message: o.message,
    status: o.status,
    read: o.read,
    created_at: fmtDate(o.created_at)
  };
}

function shapeContactMessage(doc) {
  const o = doc.toObject({ virtuals: true });
  return {
    id: o.id,
    name: o.name,
    email: o.email,
    phone: o.phone,
    subject: o.subject,
    message: o.message,
    is_read: o.is_read,
    created_at: fmtDate(o.created_at)
  };
}

function shapeUser(doc) {
  const o = doc.toObject({ virtuals: true });
  return {
    id: o.id,
    name: o.name,
    email: o.email,
    phone: o.phone,
    role: o.role,
    is_active: o.is_active,
    created_at: fmtDate(o.created_at)
  };
}

module.exports = {
  shapeHistory,
  shapeApplication,
  shapeComplaint,
  shapeSchemeApplication,
  shapeNotification,
  shapeContactMessage,
  shapeUser
};
