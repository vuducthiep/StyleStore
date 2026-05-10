export interface Size {
    id: number;
    name: string;
}

export interface ProductSize {
    id: number;
    size: Size;
    stock: number;
}

export interface ProductImage {
    id?: number;
    imageUrl: string;
    displayOrder: number;
    createdAt?: string;
}

export interface Category {
    id: number;
    name: string;
    description: string;
    status: string;
    createdAt: string;
    updatedAt: string;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    gender: string;
    brand: string;
    material?: string;
    color?: string;
    price: number;
    thumbnail: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    category: Category;
    productSizes: ProductSize[];
    productImages?: ProductImage[];
}

export interface ApiResponse {
    success: boolean;
    message: string;
    data: Product;
}