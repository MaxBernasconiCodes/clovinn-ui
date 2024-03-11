import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import {
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	Button,
} from '@mui/material'

type Column = {
	name: string
	type: string
	editable?: boolean
	editCallback?: () => void
	visible?: boolean
}

type ActionItemDataTable = {
	id: string
	label: string
	functionAction?: (itemID: string) => void
}

type DataTableProps = {
	rawData: any[]
	columns?: Column[]
	isLoading?: boolean
	loadingComponent?: JSX.Element
	error?: any
	actions?: ActionItemDataTable[]
	styles?: Record<string, any>
	rowsPerPageOptions: number
	pageNum: number
	totalQuantity: number
	setPageNum: Dispatch<SetStateAction<number>>
	emptyResultText?: string
	isPaginated?: boolean
}

function DataTable({
	rawData,
	columns,
	isLoading = false,
	loadingComponent,
	error,
	actions = [],
	styles = {},
	rowsPerPageOptions,
	pageNum,
	totalQuantity,
	setPageNum,
	emptyResultText = 'No results found',
	isPaginated = false,
}: DataTableProps) {
	const [data, setData] = useState(rawData)
	const [page, setPage] = useState(pageNum)
	const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions)
	const [headers, setHeaders] = useState(columns)

	useEffect(() => {
		if (data.length && !headers) {
			const newHeaders = Object.keys(data[0]).map((key) => ({
				name: key,
				type: typeof data[0][key],
				visible: true,
			}))
			setHeaders(newHeaders)
		}
	}, [data])

	const handleChangePage = (event: unknown, newPage: number) => {
		setPage(newPage)
		setPageNum(newPage)
	}

	const handleChangeRowsPerPage = (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		setRowsPerPage(parseInt(event.target.value, 10))
		setPage(0)
	}

	if (isLoading) {
		return loadingComponent || <div>Loading...</div>
	}

	if (error) {
		return <div>Error: {error.message}</div>
	}

	return (
		<TableContainer style={styles.TableContainer}>
			<Table style={styles.Table}>
				<TableHead style={styles.TableHead}>
					<TableRow>
						{headers &&
							headers.map(
								(header) =>
									header.visible && (
										<TableCell key={header.name} style={styles.TableCell}>
											{header.name}
										</TableCell>
									)
							)}
						{actions && <TableCell>Actions</TableCell>}
					</TableRow>
				</TableHead>
				<TableBody style={styles.TableBody}>
					{(isPaginated ? data : data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)).map(
						(row) => (
							<TableRow key={row.id}>
								{headers &&
									headers.map((header) =>
										header.visible ? (
											<TableCell key={header.name} style={styles.TableCell}>
												{row[header.name]}
											</TableCell>
										) : null
									)}
								{actions &&
									actions.map((action) => (
										<TableCell key={action.id}>
											<Button
												variant="contained"
												color="primary"
												onClick={() => action.functionAction && action.functionAction(row.id)}
											>
												{action.label}
											</Button>
										</TableCell>
									))}
							</TableRow>
						)
					)}
				</TableBody>
			</Table>
			<TablePagination
				rowsPerPageOptions={[rowsPerPageOptions]}
				component="div"
				count={totalQuantity}
				rowsPerPage={rowsPerPage}
				page={page}
				onPageChange={handleChangePage}
				onRowsPerPageChange={handleChangeRowsPerPage}
			/>
		</TableContainer>
	)
}

export default DataTable
