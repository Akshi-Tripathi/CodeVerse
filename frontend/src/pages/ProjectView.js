import React from 'react';
import Chat from '../components/Chat';

const ProjectView = ({ projectId, userId }) => {
    return (
        <div>
            <Chat projectId={projectId} userId={userId} />
        </div>
    );
};

export default ProjectView;