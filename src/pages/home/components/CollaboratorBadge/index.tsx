import React from "react";

interface CollaboratorBadgeProps {
    email: string;
}

const CollaboratorBadge: React.FC<CollaboratorBadgeProps> = ({ email }) => (
    <span className="text-xs bg-sky-100 text-sky-800 px-2 py-1 rounded">{email}</span>
);

export default CollaboratorBadge;
