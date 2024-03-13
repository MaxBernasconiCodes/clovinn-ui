import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'

import DatePicker from '@mui/lab/DatePicker'
import TimePicker from '@mui/lab/TimePicker'
import {
	Button,
	Input,
	ListSubheader,
	MenuItem,
	Rating,
	Select,
	SelectChangeEvent,
	Slider,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TablePagination,
	TableRow,
	TextareaAutosize,
	TextField,
} from '@mui/material'

type Option = {
	value: string
	display: string
	disabled?: boolean
}

type Column = {
	name: string // TODO: make name optional so that a custom field may not depend on a data column
	rename?: string
	type: string
	editable?: boolean
	editCallback?: (newValue: any, columnName: string) => void
	hidden?: boolean
	customComponent?: React.ComponentType<any>
	options?: Option[] | { groupName: string; options: Option[] }[]
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
	emptyResult?: string | JSX.Element
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
	emptyResult = 'No results found',
	isPaginated = false,
}: DataTableProps) {
	const [data, setData] = useState(rawData)
	const [page, setPage] = useState(pageNum)
	const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageOptions)
	const [headers, setHeaders] = useState(columns)

	useEffect(() => {
		if (data.length > 0 && !headers) {
			const newHeaders = Object.keys(data[0]).map((key: any) => ({
				name: key,
				type: typeof data[key],
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
									!header.hidden && (
										<TableCell key={header.name} style={styles.TableCell}>
											{header.rename || header.name}
										</TableCell>
									)
							)}
						{actions && <TableCell>Actions</TableCell>}
					</TableRow>
				</TableHead>
				<TableBody style={styles.TableBody}>
					{(isPaginated
						? data
						: data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
					).length > 0 ? (
						data.map((row) => (
							<TableRow key={row.id}>
								{headers &&
									headers.map((header) => {
										if (header.hidden) return null

										let cellContent
										if (header.customComponent) {
											const CustomComponent = header.customComponent
											cellContent = (
												<CustomComponent
													row={row}
													onChange={(
														event: React.ChangeEvent<HTMLInputElement>
													) => {
														if (header.editCallback) {
															header.editCallback(
																event.target.value,
																header.name
															)
														}
													}}
												/>
											)
										} else if (header.editable) {
											switch (header.type) {
												case 'boolean':
													cellContent = (
														<Switch
															checked={row[header.name]}
															onChange={(event) => {
																if (header.editCallback) {
																	header.editCallback(
																		event.target.checked,
																		header.name
																	)
																}
															}}
														/>
													)
													break
												case 'number':
													cellContent = (
														<TextField
															type="number"
															defaultValue={row[header.name]}
															onChange={(event) => {
																if (header.editCallback) {
																	header.editCallback(
																		event.target.value,
																		header.name
																	)
																}
															}}
														/>
													)
													break
												case 'color':
													cellContent = (
														<Input
															type="color"
															defaultValue={row[header.name]}
															onChange={(event) => {
																if (header.editCallback) {
																	header.editCallback(
																		event.target.value,
																		header.name
																	)
																}
															}}
														/>
													)
													break
												case 'range':
													cellContent = (
														<Slider
															defaultValue={row[header.name]}
															onChange={(event, newValue) => {
																if (header.editCallback) {
																	header.editCallback(newValue, header.name)
																}
															}}
														/>
													)
													break
												case 'date':
													cellContent = (
														<DatePicker
															value={row[header.name]}
															onChange={(newValue: string) => {
																if (header.editCallback) {
																	header.editCallback(newValue, header.name)
																}
															}}
														/>
													)
													break
												case 'time':
													cellContent = (
														<TimePicker
															value={row[header.name]}
															onChange={(newValue: string) => {
																if (header.editCallback) {
																	header.editCallback(newValue, header.name)
																}
															}}
														/>
													)
													break
												case 'select':
													cellContent = (
														<Select
															value={row[header.name]}
															onChange={(event: SelectChangeEvent<any>) => {
																if (header.editCallback) {
																	header.editCallback(
																		String(event.target.value),
																		header.name
																	)
																}
															}}
														>
															{Array.isArray(header.options) &&
															header.options.length > 0 &&
															'value' in header.options[0]
																? (header.options as Option[]).map(
																		(option: Option) => (
																			<MenuItem
																				key={option.value}
																				value={option.value}
																				disabled={option.disabled}
																			>
																				{option.display}
																			</MenuItem>
																		)
																	)
																: (
																		header.options as {
																			groupName: string
																			options: Option[]
																		}[]
																	).map((group) => (
																		<>
																			<ListSubheader>
																				{group.groupName}
																			</ListSubheader>
																			{group.options.map((option: Option) => (
																				<MenuItem
																					key={option.value}
																					value={option.value}
																					disabled={option.disabled}
																				>
																					{option.display}
																				</MenuItem>
																			))}
																		</>
																	))}
														</Select>
													)
													break
												case 'textarea':
													cellContent = (
														<TextareaAutosize
															defaultValue={row[header.name]}
															onChange={(event) => {
																if (header.editCallback) {
																	header.editCallback(
																		event.target.value,
																		header.name
																	)
																}
															}}
														/>
													)
													break
												case 'rating':
													cellContent = (
														<Rating
															value={row[header.name]}
															onChange={(event, newValue) => {
																if (header.editCallback) {
																	header.editCallback(newValue, header.name)
																}
															}}
														/>
													)
													break
												default:
													cellContent = (
														<TextField
															defaultValue={row[header.name]}
															onChange={(event) => {
																if (header.editCallback) {
																	header.editCallback(
																		event.target.value,
																		header.name
																	)
																}
															}}
														/>
													)
											}
										} else {
											cellContent = row[header.name]
										}

										return (
											<TableCell key={header.name} style={styles.TableCell}>
												{cellContent}
											</TableCell>
										)
									})}
								{actions &&
									actions.map((action) => (
										<TableCell key={action.id}>
											<Button
												variant="contained"
												color="primary"
												onClick={() =>
													action.functionAction && action.functionAction(row.id)
												}
											>
												{action.label}
											</Button>
										</TableCell>
									))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={headers && headers.length + (actions ? 1 : 0)}
								style={{ textAlign: 'center' }}
							>
								{emptyResult}
							</TableCell>
						</TableRow>
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