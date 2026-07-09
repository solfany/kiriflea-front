'use client';

interface MarkdownViewerProps {
  content: string;
}

export function mdToHtml(md: string): string {
  let html = md;

  // 1. Horizontal Rules
  html = html.replace(/^---$/gm, '<hr class="my-8 border-gray-100/60" />');

  // 2. Blockquotes / Tip Boxes (당근 스타일: 테두리 없이 둥근 배경만)
  html = html.replace(/^> (.*?)$/gm, 
    '<div class="flex items-start gap-3 bg-orange-50/40 rounded-2xl p-5 my-6 text-[14px] text-gray-700 leading-relaxed">' +
      '<span class="text-orange-500 text-base flex-shrink-0 mt-0.5">💡</span>' +
      '<div class="flex-1">$1</div>' +
    '</div>'
  );

  // 3. Unordered lists
  html = html.replace(/^\s*[-*]\s+(.*?)$/gm, 
    '<li class="flex items-start gap-2.5 mb-2.5 text-gray-600 text-[14px] leading-relaxed">' +
      '<span class="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0"></span>' +
      '<span class="flex-1">$1</span>' +
    '</li>'
  );

  // 4. Tables 파싱 (테두리와 섀도우를 완전히 걷어내고 Flat하게 테이블 가로선만 연하게 노출)
  const tableRegex = /(?:(?:^|\n)\|[^\n]+\|[^\n]*)+/g;
  html = html.replace(tableRegex, (match) => {
    const rows = match.trim().split('\n');
    let tableHtml = '<div class="overflow-x-auto my-6"><table class="w-full text-[13.5px] text-left text-gray-600 border-collapse">';
    
    let hasHeader = false;
    rows.forEach((row, index) => {
      if (row.match(/\|[\s-:]+\|/)) {
        hasHeader = true;
        return; 
      }
      
      const cols = row.split('|').map(c => c.trim()).filter((c, i, arr) => i > 0 && i < arr.length - 1);
      
      if (index === 0 && !hasHeader) {
        tableHtml += '<thead class="text-[12px] text-gray-800 uppercase bg-gray-50/50 border-b border-gray-100"><tr>';
        cols.forEach(col => {
          tableHtml += `<th class="px-4 py-3 font-bold tracking-wide">${col}</th>`;
        });
        tableHtml += '</tr></thead><tbody>';
      } else {
        if (index === 0 || (index === 1 && hasHeader)) {
          tableHtml += '<thead class="text-[12px] text-gray-800 uppercase bg-gray-50/50 border-b border-gray-100"><tr>';
          cols.forEach(col => {
            tableHtml += `<th class="px-4 py-3 font-bold tracking-wide">${col}</th>`;
          });
          tableHtml += '</tr></thead><tbody>';
          return;
        }
        tableHtml += '<tr class="border-b border-gray-100/50 last:border-none hover:bg-gray-50/20 transition-colors">';
        cols.forEach(col => {
          let parsedCol = col.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
          parsedCol = parsedCol.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
          
          if (parsedCol.includes('황제') || parsedCol.includes('왕족') || parsedCol.includes('귀족') || parsedCol.includes('양반') || parsedCol.includes('평민')) {
            parsedCol = `<span class="inline-flex items-center px-2 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-100/30 text-xs font-semibold">${parsedCol}</span>`;
          } else if (parsedCol.includes('천민') || parsedCol.includes('노비')) {
            parsedCol = `<span class="inline-flex items-center px-2 py-0.5 rounded bg-red-50 text-red-500 border border-red-100/30 text-xs font-semibold">${parsedCol}</span>`;
          }
          
          tableHtml += `<td class="px-4 py-3.5 font-medium text-gray-700">${parsedCol}</td>`;
        });
        tableHtml += '</tr>';
      }
    });
    tableHtml += '</tbody></table></div>';
    return tableHtml;
  });

  // 5. Headers (좌측 띠 데코는 심플하게 남김)
  html = html.replace(/^# (.*?)$/gm, '<h1 class="text-lg sm:text-xl font-bold text-gray-900 mt-2 mb-6 pb-3 border-b border-gray-100/70 leading-tight">$1</h1>');
  html = html.replace(/^## (.*?)$/gm, '<h2 class="text-[16px] font-bold text-gray-800 mt-8 mb-4 flex items-center gap-2 relative before:content-[\'\'] before:inline-block before:w-1 before:h-4 before:bg-orange-500 before:rounded-full">$1</h2>');
  html = html.replace(/^### (.*?)$/gm, '<h3 class="text-sm font-bold text-gray-700 mt-6 mb-3">$1</h3>');

  // 6. Inline formatting (코드 테두리 제거)
  const lines = html.split('\n');
  const parsedLines = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    
    // 항상 인라인 마크다운(굵게, 기울임, 코드) 처리
    let parsed = trimmed.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>');
    // 별표 하나(*)는 리스트 마커로 쓰인 경우를 피하기 위해, 양옆에 문자가 있는 경우만 처리 (단순화)
    parsed = parsed.replace(/(?<!^|\s)\*(.*?)\*(?!\s|$)/g, '<em class="italic">$1</em>'); 
    parsed = parsed.replace(/`(.*?)`/g, '<code class="bg-gray-100 text-orange-600 px-1.5 py-0.5 rounded text-xs font-semibold font-mono">$1</code>');

    if (trimmed.startsWith('<') && (trimmed.endsWith('>') || trimmed.includes('</'))) {
      return parsed; // 이미 테이블/리스트/블록쿼트 등으로 파싱된 줄
    }
    
    return `<p class="my-4 leading-relaxed text-gray-600 text-[14px]">${parsed}</p>`;
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
