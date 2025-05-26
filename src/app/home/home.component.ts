import { Component, OnInit, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltip, MatTooltipModule } from '@angular/material/tooltip';
import { BooksService } from '../services/books.service';
import { EditModalComponent } from '../modals/edit-modal/edit-modal.component';

@Component({
  selector: 'app-home',
  imports: [
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTableModule,
    MatCardModule,
    CommonModule,
    MatPaginatorModule,
    MatPaginator,
    MatSort,
    MatSortModule,
    MatTooltipModule,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  dataSource!: MatTableDataSource<any>;
  displayedColumns: string[] = [
    'isbn',
    'name',
    'estatus',
    'acciones',
  ];
  totalRecords = 0;
  pageSize = 10;
  currentPage = 0;
  @ViewChild('editTooltip') editTooltip!: MatTooltip;
  isModalOpen = false;
  tooltipsDisabled = false;
  servicios: any[] = [];
  searchText: string = '';
  userName: string = 'Usuario';
  constructor(
    private readonly dialog: MatDialog,
    private serviceBooks: BooksService,
  ) {}
  ngOnInit(): void {
    this.getData();
  }
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  async getData() {
    this.serviceBooks.getLibros(this.currentPage, this.pageSize).subscribe({
      next: (libros) => {
        this.servicios = libros.content; 
        this.totalRecords = this.servicios.length;
        this.dataSource = new MatTableDataSource(this.servicios);
        this.dataSource.filterPredicate = (data: any, filter: string) => {
          const dataStr = `${data.isbn} ${data.name} ${data.estatus}`.toLowerCase();
          return dataStr.includes(filter);
        };
      },
      error: (error) => {
        console.error('Error al cargar los libros:', error);
      }
    });
  }
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.getData();
  }
  openEditModal(row: any): void {
    this.isModalOpen= true;
    this.tooltipsDisabled=true;
    this.editTooltip?.hide();
    this.blurActiveElement();
    const dialogRef = this.dialog.open(EditModalComponent, {
      width: '400px',
      data: row,
      maxHeight:'80vh',
      autoFocus: false
    });
    dialogRef.afterClosed().subscribe((result)=>{
      this.tooltipsDisabled=false;
      if(result===true){
        this.getData();
      }
    })
  }
  openNewModal(): void {
    this.blurActiveElement();
     const dialogRef = this.dialog.open(EditModalComponent, {
      width: '400px',
      data: null,
      maxHeight:'80vh',
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe((result)=>{
      this.tooltipsDisabled=false;
      if(result===true){
        this.getData();
      }
    })
  }
  blurActiveElement(): void {
    const buttonElement = document.activeElement as HTMLElement;
    if (buttonElement) {
      buttonElement.blur();
    }
  }
  deleteRow(row: any): void {
   console.log(row);
  }
}
