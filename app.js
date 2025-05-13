const CONFIG = {
    repoOwner: 'qdqlovezhl',
    repoName: 'blog-comments',
    token: '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' // 需有repo权限
};

// DOM元素
const messageForm = document.getElementById('messageForm');
const messagesContainer = document.getElementById('messages');

// 初始化加载留言
document.addEventListener('DOMContentLoaded', loadMessages);

// 提交留言
document.getElementById('submitBtn').addEventListener('click', async () => {
    const username = document.getElementById('username').value.trim();
    const content = document.getElementById('content').value.trim();

    if (!username || !content) {
        alert('请填写昵称和留言内容');
        return;
    }

    try {
        const response = await fetch(
            `https://api.github.com/repos/${CONFIG.repoOwner}/${CONFIG.repoName}/issues`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `token ${CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: `${username}的留言`,
                    body: content
                })
            }
        );

        if (!response.ok) throw new Error('提交失败');
        document.getElementById('content').value = '';
        loadMessages();
    } catch (error) {
        console.error('提交错误:', error);
        alert('留言提交失败，请检查控制台');
    }
});

// 加载留言列表
async function loadMessages() {
    try {
        const response = await fetch(
            `https://api.github.com/repos/${CONFIG.repoOwner}/${CONFIG.repoName}/issues?state=open`,
            { headers: { 'Authorization': `token ${CONFIG.token}` } }
        );
        const issues = await response.json();
        
        messagesContainer.innerHTML = issues.map(issue => `
            <div class="message">
                <h3>${issue.title}</h3>
                <div>${issue.body}</div>
                <small>${new Date(issue.created_at).toLocaleString()}</small>
                <button onclick="deleteMessage(${issue.number})">删除</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('加载错误:', error);
    }
}

// 删除留言（通过关闭Issue）
window.deleteMessage = async (issueNumber) => {
    if (!confirm('确定删除此留言？')) return;
    
    try {
        const response = await fetch(
            `https://api.github.com/repos/${CONFIG.repoOwner}/${CONFIG.repoName}/issues/${issueNumber}`,
            {
                method: 'PATCH',
                headers: {
                    'Authorization': `token ${CONFIG.token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ state: 'closed' })
            }
        );
        
        if (response.ok) loadMessages();
    } catch (error) {
        console.error('删除错误:', error);
    }
};
