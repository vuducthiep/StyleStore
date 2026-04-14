package com.example.StyleStore.service;

import com.example.StyleStore.dto.request.ImportReceiptCreateRequest;
import com.example.StyleStore.dto.request.SupplierCreateRequest;
import com.example.StyleStore.dto.request.SupplierUpdateRequest;
import com.example.StyleStore.dto.response.ImportReceiptResponse;
import com.example.StyleStore.dto.response.SupplierResponse;
import org.springframework.data.domain.Page;

import java.util.List;

public interface ImportReceiptService {
    ImportReceiptResponse createImportReceipt(ImportReceiptCreateRequest request);

    Page<ImportReceiptResponse> getImportReceipts(int page, int size, String sortBy, String sortDir,
                                                  Long supplierId, String status);

    ImportReceiptResponse getImportReceiptById(Long id);

    Page<SupplierResponse> getSuppliers(int page, int size, String sortBy, String sortDir, String keyword);

    SupplierResponse createSupplier(SupplierCreateRequest request);

    SupplierResponse updateSupplier(Long id, SupplierUpdateRequest request);
}
