// حفظ إذن صرف في قاعدة البيانات
import axios from 'axios';

export async function saveWarehouseIssue(issueData: any) {
  // غيّر الرابط حسب API الخاص بك
  const response = await axios.post('/api/warehouse-issue', issueData);
  return response.data;
}
