import { type LightspeedClientOptions, resolveConfig } from "./config";
import { Transport } from "./core/http";
import type { HttpMethod, Query } from "./core/types";
import { AttributeResource } from "./resources/catalog/attribute";
import { BrandResource } from "./resources/catalog/brand";
import { CategoryResource } from "./resources/catalog/category";
import { ProductResource } from "./resources/catalog/product";
import { TagResource } from "./resources/catalog/tag";
import { TypeResource } from "./resources/catalog/type";
import { VariantMovementResource, VariantResource } from "./resources/catalog/variant";
import { CheckoutResource } from "./resources/sales/checkout";
import { InvoiceResource } from "./resources/sales/invoice";
import { OrderEventResource, OrderResource } from "./resources/sales/order";
import { QuoteResource } from "./resources/sales/quote";
import { ReturnResource } from "./resources/sales/return";
import { ShipmentResource } from "./resources/sales/shipment";

export class LightspeedClient {
  protected readonly transport: Transport;
  readonly products: ProductResource;
  readonly variants: VariantResource;
  readonly variantMovements: VariantMovementResource;
  readonly categories: CategoryResource;
  readonly brands: BrandResource;
  readonly types: TypeResource;
  readonly attributes: AttributeResource;
  readonly tags: TagResource;
  readonly orders: OrderResource;
  readonly orderEvents: OrderEventResource;
  readonly quotes: QuoteResource;
  readonly invoices: InvoiceResource;
  readonly shipments: ShipmentResource;
  readonly returns: ReturnResource;
  readonly checkouts: CheckoutResource;
  constructor(options: LightspeedClientOptions) {
    this.transport = new Transport(resolveConfig(options));
    this.products = new ProductResource(this.transport);
    this.variants = new VariantResource(this.transport);
    this.variantMovements = new VariantMovementResource(this.transport);
    this.categories = new CategoryResource(this.transport);
    this.brands = new BrandResource(this.transport);
    this.types = new TypeResource(this.transport);
    this.attributes = new AttributeResource(this.transport);
    this.tags = new TagResource(this.transport);
    this.orders = new OrderResource(this.transport);
    this.orderEvents = new OrderEventResource(this.transport);
    this.quotes = new QuoteResource(this.transport);
    this.invoices = new InvoiceResource(this.transport);
    this.shipments = new ShipmentResource(this.transport);
    this.returns = new ReturnResource(this.transport);
    this.checkouts = new CheckoutResource(this.transport);
  }
  // raw escape hatch (fleshed out in slice 10)
  request<T>(args: {
    method: HttpMethod;
    path: string;
    query?: Query;
    body?: unknown;
  }): Promise<T> {
    return this.transport.send<T>(args);
  }
}
