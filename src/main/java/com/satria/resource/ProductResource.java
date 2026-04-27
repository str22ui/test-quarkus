package com.satria.resource;

import com.satria.entity.Product;
import com.satria.service.ProductService;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.Optional;

@Path("/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProductResource {

    @Inject
    ProductService productService;

    // GET /products - List semua product
    @GET
    public List<Product> listAll() {
        return Product.listAll();
    }

    // POST /products - Tambah product baru
    @POST
    @Transactional
    public Response create(Product product) {
        product.persist();
        return Response.status(Response.Status.CREATED).entity(product).build();
    }

    // PUT /products/{id} - Update product berdasarkan ID
    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, Product product) {
        Optional<Product> updated = productService.update(id, product);
        if (updated.isPresent()) {
            return Response.ok(updated.get()).build();
        }
        return Response.status(Response.Status.NOT_FOUND)
                .entity("Product dengan ID " + id + " tidak ditemukan.")
                .build();
    }

    // DELETE /products/{id} - Hapus product berdasarkan ID
    @DELETE
    @Path("/{id}")
    @Transactional
    public Response delete(@PathParam("id") Long id) {
        boolean deleted = Product.deleteById(id);
        if (deleted) {
            return Response.noContent().build();
        }
        return Response.status(Response.Status.NOT_FOUND)
                .entity("Product dengan ID " + id + " tidak ditemukan.")
                .build();
    }
}
