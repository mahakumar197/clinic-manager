import {
  ApiResponse,
  ApiResponseBuilder,
  ErrorCode,
} from './api-response.interface';

describe('ApiResponse System', () => {
  describe('ApiResponseBuilder', () => {
    it('should create success responses', () => {
      const builder = new ApiResponseBuilder();
      const response = builder.success('test data', 'Operation successful');

      expect(response.success).toBe(true);
      expect(response.data).toBe('test data');
      expect(response.message).toBe('Operation successful');
      expect(response.meta).toBeDefined();
      expect(response.meta.version).toBe('v1');
      expect(response.meta.timestamp).toBeDefined();
      expect(response.meta.requestId).toBeDefined();
    });

    it('should create error responses', () => {
      const builder = new ApiResponseBuilder();
      const error = {
        code: ErrorCode.NOT_FOUND,
        message: 'Resource not found',
        timestamp: new Date().toISOString(),
        path: '/test',
        requestId: 'test-request-id',
      };
      const response = builder.error(error);

      expect(response.success).toBe(false);
      expect(response.error).toEqual(error);
      expect(response.data).toBeUndefined();
    });

    it('should create paginated responses', () => {
      const builder = new ApiResponseBuilder();
      const pagination = {
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNext: true,
        hasPrev: false,
      };
      const response = builder.paginated(['item1', 'item2'], pagination);

      expect(response.success).toBe(true);
      expect(response.data).toEqual(['item1', 'item2']);
      expect(response.meta.pagination).toEqual(pagination);
    });
  });
});
