'use client';

interface MarkdownViewerProps {
  content: string;
}

export function mdToHtml(md: string): string {
  let html = md;

  // 1. Horizontal Rules
  html = html.replace(/^---$/gm, '<hr class="my-6 border-gray-100" />');

  // 2. Blockquotes
  html = html.replace(/^> (.*?)$/gm, '<blockquote class="border-l-4 border-orange-500 bg-orange-50/40 px-4 py-3 my-4 rounded-r-xl text-gray-700">$1</blockquote>');

  // 3. Unordered lists (인접한 li를 ul로 감싸주기 편하게 하기 위해 우선 li로 변환)
  html = html.replace(/^\s*[-*]\s+(.*?)$/gm, '<li class="list-disc ml-5 mb-1.5 text-gray-600">$1</li>');

  // 4. Tables 파싱
  const tableRegex = /(?:(?:^|\n)\|[^\n]+\|[^\n]*)+/g;
  html = html.replace(tableRegex, (match) => {
    const rows = match.trim().split('\n');
    let tableHtml = '<div class="overflow-x-auto my-6 border border-gray-100 rounded-xl shadow-sm"><table class="w-full text-sm text-left text-gray-600 border-collapse">';
    
    let hasHeader = false;
    rows.forEach((row, index) => {
      // 구분선 행 제외 (e.g., | :--- | :---: | 또는 |---|)
      if (row.match(/\|[\s-:]+\|/)) {
        hasHeader = true;
        return; 
      }
      
      const cols = row.split('|').map(c => c.trim()).filter((c, i, arr) => i > 0 && i < arr.length - 1);
      
      if (index === 0 && !hasHeader) {
        tableHtml += '<thead class="text-xs text-gray-700 uppercase bg-gray-50/80 border-b border-gray-100"><tr>';
        cols.forEach(col => {
          tableHtml += `<th class="px-4 py-3 font-semibold text-gray-800">${col}</th>`;
        });
        tableHtml += '</tr></thead>';
      } else {
        if (index === 0 || (index === 1 && hasHeader)) {
          tableHtml += '<tbody>';
        }
        tableHtml += '<tr class="bg-white border-b border-gray-50 hover:bg-gray-50/50 transition-colors">';
        cols.forEach(col => {
          let parsedCol = col.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
          parsedCol = parsedCol.replace(/\*(.*?)\*/g, '<em>$1</em>');
          tableHtml += `<td class="px-4 py-3.5">${parsedCol}</td>`;
        });
        tableHtml += '</tr>';
      }
    });
    tableHtml += '</tbody></table></div>';
    return tableHtml;
  });

  // 5. Headers
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-[22px] font-extrabold text-gray-900 mt-7 mb-4 pb-2 border-b border-gray-100">$1</h1>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-lg font-bold text-gray-800 mt-6 mb-3 flex items-center gap-2">$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-base font-bold text-gray-700 mt-5 mb-2">$1</h3>');

  // 6. Inline formatting (bold, italic, code) - 블록 처리 안 된 나머지 라인들에 대해
  const lines = html.split('\n');
  const parsedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    // 이미 HTML 태그로 통째로 시작하거나 감싸인 행은 스킵
    if (trimmed.startsWith('<') && (trimmed.endsWith('>') || trimmed.includes('</'))) {
      return line;
    }
    
    let parsed = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
    parsed = parsed.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    parsed = parsed.replace(/`(.*?)`/g, '<code class="bg-gray-100 text-orange-600 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');
    return `<p class="my-3.5 leading-relaxed text-gray-600 text-[15px]">${parsed}</p>`;
  });
  html = parsedLines.join('\n');

  return html;
}

export default function MarkdownViewer({ content }: MarkdownViewerProps) {
  const htmlContent = mdToHtml(content);

  return (
    <div 
      className="prose max-w-none text-gray-800 animate-fadeIn"
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
}
