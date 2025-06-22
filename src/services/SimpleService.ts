import { BaseApiService } from "./BaseService";

// class OrderService extends BaseApiService<any> {
//   private readonly aSvc: typeof AService;

  // 2. Nhận tham số trong constructor
//   constructor(aSvc: typeof AService,) {
//     //setURL
//     super('/');
//     // 3. Gán giá trị một cách tường minh
//     this.aSvc = AService;

//   }

//   use Parameter Properties Shorthand
import type { SimplateAType, SimpleADataType } from '@/types/simple'
class SimpleService extends BaseApiService<any> {
  constructor(
    // private readonly ASvc: typeof AService,
  ) {
    super('orders');
    // KHÔNG CẦN VIẾT GÌ THÊM Ở ĐÂY!
  }

  public async aFunction(data: SimplateAType): Promise<SimpleADataType> {
    // Vẫn có thể dùng this.productSvc một cách bình thường
    // const a = await this.ASvc.getOne(a.a_+id);
    // ...
    return  Promise.resolve({id: "1", a_id:"1", count :1 })
  }
//     aFunction(data: SimplateAType): Promise<SimpleADataType> {
//     // Vẫn có thể dùng this.productSvc một cách bình thường
//     // const a = await this.ASvc.getOne(a.a_+id);
//     // ...
//       return  Promise.resolve({id: "1", a_id:"1", count :1 })
//   }
//     aFunction = (data: SimplateAType): Promise<SimpleADataType> => {
//     // Vẫn có thể dùng this.productSvc một cách bình thường
//     // const a = await this.ASvc.getOne(a.a_+id);
//     return  Promise.resolve({id: "1", a_id:"1", count :1 })
//   }
}