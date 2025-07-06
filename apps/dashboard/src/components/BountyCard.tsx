import React from 'react';

interface BountyCardProps {
  id: string;
  title: string;
  description: string;
  reward: string;
  status: string;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Open':
      return 'bg-blue-100 text-blue-800';
    case 'Accepted':
      return 'bg-green-100 text-green-800';
    case 'Completed':
      return 'bg-purple-100 text-purple-800';
    case 'Paid':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const BountyCard: React.FC<BountyCardProps> = ({ id, title, description, reward, status }) => {
  const statusColorClass = getStatusColor(status);

  return (
    <div className="bg-white shadow-md rounded-lg p-6 mb-4">
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-700 mb-4">{description}</p>
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold text-indigo-600">{reward}</span>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColorClass}`}>
          {status}
        </span>
      </div>
      <a href={`/bounty/${id}`} className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-medium">
        View Details
      </a>
    </div>
  );
};

export default BountyCard;