import api from './api';

interface ExportRequest {
  content: string;
  format: string;
  fileName: string;
}

export const exportApi = {
  export: (data: ExportRequest) =>
    api.post('/export', data, {
      responseType: 'arraybuffer',
    }),
};
