import type { z } from "zod";
import { type LightspeedClientOptions, resolveConfig } from "./config";
import { Transport } from "./core/http";
import type { HttpMethod, Query } from "./core/types";
import { AttributeResource } from "./resources/catalog/attribute";
import { BrandResource } from "./resources/catalog/brand";
import { CategoryResource } from "./resources/catalog/category";
import { ProductResource } from "./resources/catalog/product";
import { QuantityDiscountResource } from "./resources/catalog/quantity-discount";
import { TagResource } from "./resources/catalog/tag";
import { TypeResource } from "./resources/catalog/type";
import { TypeAttributeResource } from "./resources/catalog/type-attribute";
import { VariantMovementResource, VariantResource } from "./resources/catalog/variant";
import { CustomerResource } from "./resources/customers/customer";
import { GroupResource } from "./resources/customers/group";
import { CategoriesProductResource } from "./resources/joins/categories-product";
import { GroupsCustomerResource } from "./resources/joins/groups-customer";
import { TagsProductResource } from "./resources/joins/tags-product";
import { CheckoutResource } from "./resources/sales/checkout";
import { InvoiceResource } from "./resources/sales/invoice";
import { OrderEventResource, OrderResource } from "./resources/sales/order";
import { OrderCustomStatusResource } from "./resources/sales/order-custom-status";
import { QuoteResource } from "./resources/sales/quote";
import { ReturnResource } from "./resources/sales/return";
import { ShipmentResource } from "./resources/sales/shipment";
import { AccountResource } from "./resources/store/account";
import { ShopResource } from "./resources/store/shop";
import { WebhookResource } from "./resources/store/webhook";

export class LightspeedClient {
  protected readonly transport: Transport;
  readonly account: AccountResource;
  readonly shop: ShopResource;
  readonly webhooks: WebhookResource;
  readonly products: ProductResource;
  readonly variants: VariantResource;
  readonly variantMovements: VariantMovementResource;
  readonly categories: CategoryResource;
  readonly brands: BrandResource;
  readonly types: TypeResource;
  readonly typeAttributes: TypeAttributeResource;
  readonly attributes: AttributeResource;
  readonly tags: TagResource;
  readonly quantityDiscounts: QuantityDiscountResource;
  readonly orders: OrderResource;
  readonly orderEvents: OrderEventResource;
  readonly orderCustomStatuses: OrderCustomStatusResource;
  readonly quotes: QuoteResource;
  readonly invoices: InvoiceResource;
  readonly shipments: ShipmentResource;
  readonly returns: ReturnResource;
  readonly checkouts: CheckoutResource;
  readonly customers: CustomerResource;
  readonly groups: GroupResource;
  readonly categoriesProducts: CategoriesProductResource;
  readonly tagsProducts: TagsProductResource;
  readonly groupsCustomers: GroupsCustomerResource;
  constructor(options: LightspeedClientOptions) {
    this.transport = new Transport(resolveConfig(options));
    this.account = new AccountResource(this.transport);
    this.shop = new ShopResource(this.transport);
    this.webhooks = new WebhookResource(this.transport);
    this.products = new ProductResource(this.transport);
    this.variants = new VariantResource(this.transport);
    this.variantMovements = new VariantMovementResource(this.transport);
    this.categories = new CategoryResource(this.transport);
    this.brands = new BrandResource(this.transport);
    this.types = new TypeResource(this.transport);
    this.typeAttributes = new TypeAttributeResource(this.transport);
    this.attributes = new AttributeResource(this.transport);
    this.tags = new TagResource(this.transport);
    this.quantityDiscounts = new QuantityDiscountResource(this.transport);
    this.orders = new OrderResource(this.transport);
    this.orderEvents = new OrderEventResource(this.transport);
    this.orderCustomStatuses = new OrderCustomStatusResource(this.transport);
    this.quotes = new QuoteResource(this.transport);
    this.invoices = new InvoiceResource(this.transport);
    this.shipments = new ShipmentResource(this.transport);
    this.returns = new ReturnResource(this.transport);
    this.checkouts = new CheckoutResource(this.transport);
    this.customers = new CustomerResource(this.transport);
    this.groups = new GroupResource(this.transport);
    this.categoriesProducts = new CategoriesProductResource(this.transport);
    this.tagsProducts = new TagsProductResource(this.transport);
    this.groupsCustomers = new GroupsCustomerResource(this.transport);
  }
  // low-level escape hatch for endpoints/params not yet covered by a resource.
  // pass a schema to validate+type the response; omit it to get the raw body.
  async request<T>(args: {
    method: HttpMethod;
    path: string;
    query?: Query;
    body?: unknown;
    schema?: z.ZodType<T>;
  }): Promise<T> {
    const raw = await this.transport.send<T>({
      method: args.method,
      path: args.path,
      query: args.query,
      body: args.body,
    });
    return args.schema ? args.schema.parse(raw) : (raw as T);
  }
}
