/**
 * Sanity Studio bootstrap.
 * React root mount for the embedded Studio.
 */
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { Studio } from 'sanity';
import config from './sanity.config.js';

createRoot(document.getElementById('sanity')).render(
	<StrictMode>
		{config.projectId && config.projectId !== 'your_project_id_here' ? <Studio config={config} /> : (
			<main style={{ maxWidth: '42rem', margin: '12vh auto', padding: '2rem', fontFamily: 'Georgia, serif', lineHeight: 1.8 }}>
				<h1>连接创作档案</h1>
				<p>请在项目根目录的 .env.local 中设置 PUBLIC_SANITY_PROJECT_ID 与 PUBLIC_SANITY_DATASET，然后重启 Studio。</p>
				<p>尚未创建项目？前往 <a href="https://www.sanity.io/manage">Sanity 管理控制台</a> 创建。请勿把私有 Token 放进 PUBLIC_ 环境变量。</p>
			</main>
		)}
	</StrictMode>
);
