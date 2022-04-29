import React from "react";

const NotionAuthButton: React.FC = () => {
    return (
        <div>
            <button type="button" onClick={(e) => {
                e.preventDefault();
                window.location.href='https://api.notion.com/v1/oauth/authorize?owner=user&client_id=7e82f198-4aba-4022-bf2a-f16ec5a791f3&redirect_uri=http://localhost:3000&response_type=code';
                }}>
            Go to Notion
            </button>
        </div>
    );
};

export default NotionAuthButton;