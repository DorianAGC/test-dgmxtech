import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BooksService } from '../../services/books.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-edit-modal',
  imports: [
    MatLabel,
    MatFormField,
    MatCardModule,
    MatInputModule,
    CommonModule,
    MatTooltipModule,
    FormsModule,
  ],
  templateUrl: './edit-modal.component.html',
  styleUrl: './edit-modal.component.css',
})
export class EditModalComponent implements OnInit {
  @ViewChild('editForm') editForm!: NgForm; // Referencia al formulario
  @ViewChild('serviceInput') serviceInput!: NgModel; // Referencia al formulario
  pageSize = 10;
  currentPage = 0;
  isEditMode!: boolean;
  name: string = '';
  isbn: string = '';
  estatus: string = '';
  categoria:  string = '';
  formErrors: string[] = [];
  errorMessage: string = '';
  constructor(
    public dialogRef: MatDialogRef<EditModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private serviceBooks: BooksService,
  ) {
    this.isEditMode = !!data;
  }
  ngOnInit(): void {
    if (this.isEditMode) {
      this.initializeData();
    }
  }
  close(): void {
    this.dialogRef.close();
  }
  onSubmit(editForm: NgForm): void {
    this.checkFieldsValidity(editForm);
    if (editForm.invalid) {
      console.log('Formulario inválido');
      return;
    }
    if (this.isEditMode) {
      this.editService(editForm.value);
    } else {
      this.saveService(editForm.value);
    }
  }
  async editService(data: any) {
    const requestEdit = {
      isbn: this.isbn,
      name: this.name,
      estatus: this.estatus,
      categoria: this.categoria
    };
    try {
      await this.serviceBooks.updateLibros(
        this.data.isbn,
        requestEdit
      );
      Swal.fire({
        icon: 'success',
        title: 'Se Editado!',
        text: ` Se ha editado el servicio exitosamente.`,
        confirmButtonText: 'Aceptar',
      }).then(() => {
        this.dialogRef.close(true); // Cierra el modal después de mostrar el mensaje
      });
    } catch (error) {
      console.error('Error al guardar el nuevo servicio:', error);
      this.dialogRef.close();
    }
    console.log('Editando nuevo servicio con los datos:', data);
  }
  async saveService(data: any) {
    const requestSave = {
      isbn: this.isbn,
      name: this.name,
      estatus: this.estatus,
      id_categoria: this.categoria
    };
    try {
      await this.serviceBooks.postLibros(requestSave);
      Swal.fire({
        icon: 'success',
        title: 'Se Creado!',
        text: ` se ha creado el nuevo servicio exitosamente.`,
        confirmButtonText: 'Aceptar',
      }).then(() => {
        this.dialogRef.close(true); // Cierra el modal después de mostrar el mensaje
      });
    } catch (error) {
      console.error('Error al guardar el nuevo servicio:', error);
      this.dialogRef.close();
    }
    console.log('Guardando nuevo servicio con los datos:', data);
  }
  initializeData(): void {
    this.isbn = this.data.isbn;
    this.name = this.data.name;
    this.estatus = this.data.estatus;
    this.categoria = this.data.id_categoria;
  }
  checkFieldsValidity(form: NgForm): void {
    this.formErrors = [];
    for (const controlName in form.controls) {
      const control = form.controls[controlName];
      if (control.invalid) {
        this.formErrors.push(`El campo ${controlName} es requerido.`);
      }
    }
    if (this.formErrors.length === 0) {
      this.errorMessage = '';
    }
  }
}
