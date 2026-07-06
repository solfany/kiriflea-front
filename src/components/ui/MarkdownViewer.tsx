'use client';

interface MarkdownViewerProps {
  content: string;
}

export function mdToHtml(md: string): string {
  let html = md;

  // 1. Horizontal Rules
  html = html.replace(/^---$/gm, '<hr class="my-8 border-gray-100" />');

  // 2. Blockquotes / Tip Boxes (둥글둥글하고 예쁘게)
  html = html.replace(/^> (.*?)$/gm, 
    '<div class="flex items-start gap-3 border border-orange-100/70 bg-orange-50/40 rounded-2xl p-4.5 my-6 text-[14.5px] text-gray-700 leading-relaxed shadow-sm">' +
      '<span class="text-orange-500 text-base flex-shrink-0 mt-0.5">💡</span>' +
      '<div class="flex-1">$1</div>' +
    '</div>'
  );

  // 3. Unordered lists
  html = html.replace(/^\s*[-*]\s+(.*?)$/gm, 
    '<li class="flex items-start gap-2.5 mb-2.5 text-gray-600 text-[14.5px] leading-relaxed">' +
      '<span class="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0"></span>' +
      '<span class="flex-1">$1</span>' +
    '</li>'
  );

  // 4. Tables 파싱 (세로선 없이 카카오/네이버 고객센터 스타일로 둥글둥글하게)
  const tableRegex = /(?:(?:^|\n)\|[^\n]+\|[^\n]*)+/g;
  html = html.replace(tableRegex, (match) => {
    const rows = match.trim().split('\n');
    let tableHtml = '<div class="overflow-hidden my-6 border border-gray-100/80 rounded-2xl shadow-sm bg-white"><table class="w-full text-sm text-left text-gray-600 border-collapse">';
    
    let hasHeader = false;
    rows.forEach((row, index) => {
      if (row.match(/\|[\s-:]+\|/)) {
        hasHeader = true;
        return; 
      }
      
      const cols = row.split('|').map(c => c.trim()).filter((c, i, arr) => i > 0 && i < arr.length - 1);
      
      if (index === 0 && !hasHeader) {
        tableHtml += '<thead class="text-[12px] text-gray-700 uppercase bg-gray-50/70 border-b border-gray-100"><tr>';
        cols.forEach(col => {
          tableHtml += `<th class="px-5 py-3.5 font-bold text-gray-800 tracking-wide">${col}</th>`;
        });
        tableHtml += '</tr></thead><tbody>';
      } else {
        if (index === 0 || (index === 1 && hasHeader)) {
          tableHtml += '<thead class="text-[12px] text-gray-700 uppercase bg-gray-50/70 border-b border-gray-100"><tr>';
          cols.forEach(col => {
            tableHtml += `<th class="px-5 py-3.5 font-bold text-gray-800 tracking-wide">${col}</th>`;
          });
          tableHtml += '</tr></thead><tbody>';
          return;
        }
        tableHtml += '<tr class="border-b border-gray-50 last:border-none hover:bg-gray-50/40 transition-colors">';
        cols.forEach(col => {
          let parsedCol = col.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
          parsedCol = parsedCol.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
          
          // '황제', '왕족' 같은 계급 텍스트에 컬러 뱃지 느낌을 주는 스페셜 매핑
          if (parsedCol.includes('황제') || parsedCol.includes('왕족') || parsedCol.includes('귀족') || parsedCol.includes('양반') || parsedCol.includes('평민')) {
            parsedCol = `<span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-50 text-orange-600 border border-orange-100/50">${parsedCol}</span>`;
          } else if (parsedCol.includes('천민') || parsedCol.includes('노비')) {
            parsedCol = `<span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-500 border border-red-100/50">${parsedCol}</span>`;
          }
          
          tableHtml += `<td class="px-5 py-4 font-medium text-gray-700">${parsedCol}</td>`;
        });
        tableHtml += '</tr>';
      }
    });
    tableHtml += '</tbody></table></div>';
    return tableHtml;
  });

  // 5. Headers (귀엽고 둥근 데코레이션 추가)
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-xl sm:text-2xl font-black text-gray-900 mt-2 mb-6 pb-4 border-b border-gray-100/80 leading-tight">$1</h1>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-[17px] font-extrabold text-gray-800 mt-8 mb-4 flex items-center gap-2 relative before:content-[\'\'] before:inline-block before:w-1 before:h-4.5 before:bg-orange-500 before:rounded-full">$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-base font-bold text-gray-700 mt-6 mb-3">$1</h3>');

  // 6. Inline formatting
  const lines = html.split('\n');
  const parsedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<') && (trimmed.endsWith('>') || trimmed.includes('</'))) {
      return line;
    }
    
    let parsed = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
    parsed = parsed.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
    parsed = parsed.replace(/`(.*?)`/g, '<code class="bg-gray-100 text-orange-600 px-1.5 py-0.5 rounded text-xs font-semibold font-mono border border-gray-200/50">$1</code>');
    return `<p class="my-4 leading-relaxed text-gray-600 text-[14.5px]">${parsed}</p>`;
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
